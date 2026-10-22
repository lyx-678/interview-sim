import { NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";

type Role = "system" | "user" | "assistant";
type ChatMessage = { role: Role; content: string };

type RequestBody = {
  stage?: "interview" | "evaluate";
  position?: string;
  type?: string;
  years?: string;
  questionIndex?: number;
  messages?: ChatMessage[];
};

function interviewerSystem(position: string, type: string, years: string, questionIndex: number) {
  const focus =
    type === "HR 面"
      ? "重点考察求职动机、稳定性、职业规划、团队协作。"
      : "重点考察专业能力、项目经验、问题拆解与解决。";

  return `你是一位资深的「${position}」岗位面试官，正在进行「${type}」面试。
候选人背景：${years}。
${focus}

规则：
1. 这是第 ${questionIndex} 题（共 5 题）。
2. 一次只提一个问题，紧扣「${position}」岗位。
3. 结合候选人的上一轮回答，可以追问细节，也可以开启新话题。
4. 语气专业、友好，不要一次给太多信息。
5. 只输出问题本身：不要加「第 N 题」前缀，不要解释，不要点评。

处理候选人「答不上来」的情况（重要）：
- 如果候选人表示「没接触过 / 没参与 / 不会 / 想换个问题 / 跳过」，不要追问原题，也不要点评或施压。
- 先用一句自然的话过渡（例如「没关系，那我们换个方向」），然后提出一个**不同的问题**：可以换考点、降低难度，或问候选人更熟悉的经历。
- 不要重复或改写刚才的问题。
- 如果候选人两次以上表示不会，就换到更基础、更通用的题目。`;
}

function evaluatorSystem(position: string, type: string, years: string) {
  return `你是一位资深面试官。下面是一次「${position}」岗位「${type}」面试的完整对话，候选人为${years}。

请评估候选人表现，严格输出 JSON（不要输出任何其他文字），结构如下：
{
  "score": 0到100的整数,
  "level": "优秀" 或 "良好" 或 "待提升" 或 "需加强",
  "dimensions": [
    {"label": "表达清晰度", "score": 0到100},
    {"label": "逻辑结构", "score": 0到100},
    {"label": "专业深度", "score": 0到100},
    {"label": "问题洞察", "score": 0到100},
    {"label": "岗位匹配度", "score": 0到100}
  ],
  "perQuestion": [
    {"question": "题目", "answer": "候选人回答摘要", "score": 0到100, "comment": "点评", "reference": "参考答案"}
  ],
  "weaknesses": ["薄弱项1", "薄弱项2", "薄弱项3"],
  "suggestions": ["建议1", "建议2", "建议3"]
}

评分标准：90-100 优秀，75-89 良好，60-74 待提升，60 以下 需加强。
点评要具体，指出好在哪、差在哪；参考答案要可直接借鉴。
注意：如果某轮候选人回答「不会 / 没接触过 / 想换题」这类内容，该轮不计入评分，也不要在点评里批评。`;
}

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "服务端未配置 DEEPSEEK_API_KEY" }, { status: 500 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "请求格式错误，需要 JSON" }, { status: 400 });
  }

  const { stage = "interview", position, type, years, questionIndex = 1, messages = [] } = body;

  if (!position || !type || !years) {
    return NextResponse.json({ error: "缺少 position / type / years" }, { status: 400 });
  }
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "messages 必须是数组" }, { status: 400 });
  }

  const isEvaluate = stage === "evaluate";

  const system: ChatMessage = {
    role: "system",
    content: isEvaluate
      ? evaluatorSystem(position, type, years)
      : interviewerSystem(position, type, years, questionIndex),
  };

  let conversation: ChatMessage[];
  if (isEvaluate) {
    const transcript =
      messages.length > 0
        ? messages
            .map((m) => `${m.role === "assistant" ? "面试官" : "候选人"}：${m.content}`)
            .join("\n")
        : "（无对话记录）";
    conversation = [
      {
        role: "user",
        content: `以下是岗位「${position}」的「${type}」面试对话记录：\n\n${transcript}\n\n请评估候选人表现，严格输出 JSON。`,
      },
    ];
  } else {
    conversation =
      messages.length > 0
        ? messages
        : [{ role: "user", content: "（面试开始，请提出第 1 个问题）" }];
  }

  const payload: Record<string, unknown> = {
    model: MODEL,
    messages: [system, ...conversation],
    temperature: isEvaluate ? 0.3 : 0.8,
    max_tokens: isEvaluate ? 2000 : 300,
  };
  if (isEvaluate) {
    payload.response_format = { type: "json_object" };
  }

  try {
    const resp = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return NextResponse.json(
        { error: `DeepSeek 调用失败（${resp.status}）`, detail },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";

    if (isEvaluate) {
      const parsed = extractJson(content);
      if (!parsed) {
        return NextResponse.json(
          { error: "评估结果解析失败", raw: content },
          { status: 502 }
        );
      }
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ reply: content.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `请求 DeepSeek 失败：${message}` }, { status: 502 });
  }
}
