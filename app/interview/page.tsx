"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Msg = { role: "assistant" | "user"; content: string };

const TOTAL = 5;

function InterviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const position = searchParams.get("position") ?? "后端开发工程师";
  const type = searchParams.get("type") ?? "业务面";
  const years = searchParams.get("years") ?? "应届";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const started = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void askQuestion(1, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function askQuestion(index: number, history: Msg[]) {
    setLoading(true);
    setStatus("AI 正在出题…");
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: "interview",
          position,
          type,
          years,
          questionIndex: index,
          messages: history,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "出题失败");
      setMessages([...history, { role: "assistant", content: data.reply }]);
      setQuestionIndex(index);
    } catch (e) {
      setError(e instanceof Error ? e.message : "出题失败，请重试");
    } finally {
      setLoading(false);
      setStatus("");
    }
  }

  async function evaluate(history: Msg[]) {
    if (history.length === 0) {
      setError("还没有对话内容，不能生成报告");
      return;
    }
    setLoading(true);
    setStatus("AI 正在评估…");
    setError("");
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "evaluate", position, type, years, messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "评估失败");
      sessionStorage.setItem(
        "interviewReport",
        JSON.stringify({ position, type, years, ...data })
      );
      setDone(true);
      router.push("/report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "评估失败，请重试");
      setLoading(false);
      setStatus("");
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || done) return;

    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");

    if (questionIndex >= TOTAL) {
      await evaluate(nextMessages);
    } else {
      await askQuestion(questionIndex + 1, nextMessages);
    }
  }

  async function skipQuestion() {
    if (loading || done || questionIndex === 0) return;
    const text = "这个问题我没有接触过，能换一个问题吗？";
    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    // 换题不消耗题号
    await askQuestion(questionIndex, nextMessages);
  }

  const progress = Math.min(100, (Math.max(questionIndex, 1) / TOTAL) * 100);
  const canEarlyFinish = !loading && !done && messages.length > 0;

  return (
    <main className="interview-shell">
      <div className="interview-topbar">
        <Link className="back" href="/">
          ← 退出
        </Link>
        <div className="interview-meta">
          <span className="badge">
            {position} · {type}
          </span>
          <span className="progress-text">
            第 {Math.max(questionIndex, 1)} / {TOTAL} 题
          </span>
          <button
            className="text-btn"
            type="button"
            onClick={() => void skipQuestion()}
            disabled={loading || done || questionIndex === 0}
          >
            换一题
          </button>
          <button
            className="text-btn"
            type="button"
            onClick={() => evaluate(messages)}
            disabled={!canEarlyFinish}
          >
            提前结束
          </button>
        </div>
      </div>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="chat">
        {messages.map((m, i) => (
          <div className={`msg ${m.role === "assistant" ? "msg-ai" : "msg-user"}`} key={i}>
            {m.role === "assistant" && <div className="avatar">AI</div>}
            <div className="bubble">{m.content}</div>
            {m.role === "user" && <div className="avatar">我</div>}
          </div>
        ))}

        {loading && (
          <div className="msg msg-ai">
            <div className="avatar">AI</div>
            <div className="bubble thinking">{status || "AI 正在思考…"}</div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <textarea
          className="textarea"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder={
            done ? "面试已结束" : "输入你的回答……（Enter 发送，Shift + Enter 换行）"
          }
          disabled={loading || done}
        />
        <button className="btn" type="button" onClick={() => void handleSend()} disabled={loading || done || !input.trim()}>
          发送
        </button>
      </div>

      <p className="hint center">
        答不上来可以点「换一题」· 答完 5 题自动生成报告
      </p>
    </main>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <main className="container">
          <p className="muted">加载中…</p>
        </main>
      }
    >
      <InterviewInner />
    </Suspense>
  );
}
