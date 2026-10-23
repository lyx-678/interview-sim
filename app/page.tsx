"use client";

import Link from "next/link";
import { useState } from "react";
import { track } from "@vercel/analytics";

const INDUSTRIES = [
  {
    industry: "互联网 / IT",
    positions: [
      { name: "后端开发工程师", topics: "系统设计 · 并发处理 · 数据库 · 项目复盘" },
      { name: "前端开发工程师", topics: "工程化 · 性能优化 · 交互实现 · 项目复盘" },
      { name: "全栈开发工程师", topics: "前后端协作 · 接口设计 · 部署 · 项目" },
      { name: "移动端开发工程师", topics: "性能 · 兼容性 · 架构 · 项目" },
      { name: "算法工程师", topics: "模型原理 · 特征工程 · 落地效果 · 论文/竞赛" },
      { name: "机器学习工程师", topics: "训练与推理 · 特征 · 评估指标 · 落地" },
      { name: "计算机视觉工程师", topics: "模型选型 · 数据处理 · 部署 · 竞赛" },
      { name: "自然语言处理工程师", topics: "预训练 · 微调 · 评估 · 应用" },
      { name: "推荐算法工程师", topics: "召回排序 · 冷启动 · AB 实验 · 指标" },
      { name: "大数据开发工程师", topics: "数据链路 · 数仓建模 · 性能调优" },
      { name: "数据分析师", topics: "指标体系 · SQL · 归因分析 · 业务洞察" },
      { name: "数据挖掘工程师", topics: "特征 · 建模 · 评估 · 业务落地" },
      { name: "测试工程师", topics: "测试设计 · 用例 · 缺陷分析 · 质量" },
      { name: "自动化测试工程师", topics: "框架 · 脚本 · CI/CD · 稳定性" },
      { name: "运维工程师", topics: "稳定性 · 监控告警 · 故障排查" },
      { name: "安全工程师", topics: "攻防 · 漏洞 · 合规 · 应急" },
      { name: "网络工程师", topics: "协议 · 组网 · 排障 · 安全" },
      { name: "数据库工程师", topics: "建模 · 优化 · 高可用 · 迁移" },
      { name: "产品经理", topics: "需求分析 · 竞品 · 数据驱动 · 项目推进" },
      { name: "数据产品经理", topics: "指标体系 · 数据看板 · 需求 · 落地" },
      { name: "产品运营", topics: "用户增长 · 活动 · 数据分析 · 转化" },
      { name: "用户运营", topics: "用户分层 · 留存 · 社群 · 生命周期" },
      { name: "内容运营", topics: "选题 · 内容生产 · 分发 · 数据" },
      { name: "新媒体运营", topics: "平台规则 · 选题 · 涨粉 · 转化" },
      { name: "项目管理", topics: "进度 · 风险 · 沟通 · 复盘" },
    ],
  },
  {
    industry: "电子 / 通信 / 硬件",
    positions: [
      { name: "嵌入式软件工程师", topics: "C 语言 · 驱动开发 · RTOS · 调试" },
      { name: "嵌入式硬件工程师", topics: "原理图 · PCB · 调试 · 量产" },
      { name: "硬件工程师", topics: "电路设计 · 元器件选型 · 调试 · EMC" },
      { name: "射频工程师", topics: "射频电路 · 天线 · 测试 · 调试" },
      { name: "通信工程师", topics: "协议 · 信号处理 · 组网 · 项目经验" },
      { name: "芯片设计工程师", topics: "数字/模拟设计 · Verilog · 验证 · 流片" },
      { name: "FPGA 工程师", topics: "Verilog/VHDL · 时序 · 验证 · 调试" },
      { name: "PCB 设计工程师", topics: "布局布线 · 信号完整性 · 工艺" },
    ],
  },
  {
    industry: "机械 / 制造 / 自动化",
    positions: [
      { name: "机械工程师", topics: "结构设计 · 工艺 · 材料 · 项目经验" },
      { name: "机械设计工程师", topics: "三维建模 · 公差 · 选型 · 样机" },
      { name: "自动化工程师", topics: "PLC · 控制逻辑 · 产线调试" },
      { name: "电气工程师", topics: "电气设计 · 选型 · 调试 · 安全规范" },
      { name: "工艺工程师", topics: "制造工艺 · 良率 · 现场改善 · 成本" },
      { name: "工业工程师", topics: "流程优化 · 效率 · 精益 · 数据分析" },
      { name: "质量工程师", topics: "质量体系 · 检验 · 8D · 持续改进" },
      { name: "设备工程师", topics: "设备维护 · 故障处理 · 改造 · 安全" },
    ],
  },
  {
    industry: "建筑 / 土木 / 工程",
    positions: [
      { name: "土木工程师", topics: "结构计算 · 施工工艺 · 规范 · 项目经历" },
      { name: "结构工程师", topics: "受力分析 · 设计软件 · 规范" },
      { name: "岩土工程师", topics: "勘察 · 地基 · 边坡 · 规范" },
      { name: "造价工程师", topics: "算量 · 计价 · 成本控制" },
      { name: "施工管理", topics: "进度 · 质量 · 安全 · 现场协调" },
      { name: "测绘工程师", topics: "测量 · 仪器 · 数据处理 · 规范" },
      { name: "给排水工程师", topics: "系统设计 · 规范 · 选型 · 施工" },
      { name: "暖通工程师", topics: "负荷计算 · 系统 · 规范 · 调试" },
    ],
  },
  {
    industry: "化工 / 材料 / 环境",
    positions: [
      { name: "化学工程师", topics: "工艺设计 · 反应原理 · 安全 · 实验" },
      { name: "化工工艺工程师", topics: "流程 · 设备 · 安全 · 中试放大" },
      { name: "材料工程师", topics: "材料性能 · 表征 · 研发流程" },
      { name: "环境工程师", topics: "治理工艺 · 监测 · 环评 · 规范" },
      { name: "安全工程师（化工）", topics: "风险辨识 · 操作规程 · 应急" },
      { name: "食品研发工程师", topics: "配方 · 工艺 · 检测 · 法规" },
    ],
  },
  {
    industry: "生物 / 医药",
    positions: [
      { name: "生物医药研发", topics: "实验设计 · 数据分析 · 文献 · 项目" },
      { name: "临床研究（CRA）", topics: "GCP · 临床试验流程 · 沟通协调" },
      { name: "医学检验", topics: "检验项目 · 仪器 · 质控" },
      { name: "制药工程", topics: "工艺 · GMP · 验证 · 生产" },
      { name: "医疗器械工程师", topics: "设计 · 法规 · 测试 · 注册" },
    ],
  },
  {
    industry: "新能源 / 汽车",
    positions: [
      { name: "电池研发工程师", topics: "电化学 · 材料 · 测试 · 安全" },
      { name: "储能工程师", topics: "系统设计 · 安全 · 并网 · 项目" },
      { name: "光伏工程师", topics: "组件 · 系统设计 · 效率 · 项目" },
      { name: "风电工程师", topics: "机组 · 运维 · 并网 · 项目" },
      { name: "汽车电子工程师", topics: "CAN 总线 · 控制器 · 标定" },
      { name: "整车测试工程师", topics: "测试方案 · 数据 · 问题定位" },
      { name: "车身/底盘工程师", topics: "结构 · 材料 · 工艺 · 项目" },
    ],
  },
  {
    industry: "金融科技 / 量化",
    positions: [
      { name: "量化研究员", topics: "统计建模 · 回测 · 策略 · 编程" },
      { name: "风控建模", topics: "风控模型 · 特征 · 评估指标" },
      { name: "金融数据分析", topics: "指标体系 · SQL · 报表 · 洞察" },
    ],
  },
  {
    industry: "科研 / 教育",
    positions: [
      { name: "科研助理", topics: "实验 · 文献 · 数据分析 · 项目" },
      { name: "算法研究", topics: "论文 · 复现 · 创新点 · 实验" },
      { name: "高校教师", topics: "教学 · 科研 · 项目申报" },
    ],
  },
];

const ALL_POSITIONS = INDUSTRIES.flatMap((g) => g.positions);
const DEFAULT_POSITION = "后端开发工程师";

export default function HomePage() {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [type, setType] = useState("业务面");
  const [years, setYears] = useState("应届");

  const selected = ALL_POSITIONS.find((p) => p.name === position);
  const topics = selected?.topics ?? "";

  const focusText =
    type === "业务面"
      ? `业务面将侧重：${topics}`
      : `HR 面将结合「${position}」岗位，侧重：求职动机 · 稳定性 · 职业规划 · 团队协作`;

  const href = `/interview?position=${encodeURIComponent(position)}&type=${encodeURIComponent(
    type
  )}&years=${encodeURIComponent(years)}`;

  return (
    <main className="container">
      <header className="hero">
        <div className="badge">面向理工科学生</div>
        <h1 className="product-name">OfferLab</h1>
        <p className="product-tagline">理工科求职者的 AI 面试训练场</p>
        <p className="subtitle">
          覆盖互联网、电子通信、机械制造、土木建筑、化工材料、生物医药、新能源、金融科技、科研教育等方向。
          选好岗位，AI 会像真实面试官一样连续追问；答完立即拿到评分、逐题点评和参考答案。
        </p>
      </header>

      <section className="card">
        <h2 className="card-title">开始面试</h2>

        <div className="form-group">
          <label className="form-label" htmlFor="position">
            目标岗位
          </label>
          <select
            id="position"
            className="select"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            {INDUSTRIES.map((group) => (
              <optgroup key={group.industry} label={group.industry}>
                {group.positions.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">面试类型</label>
          <div className="option-row">
            {["业务面", "HR 面"].map((t) => (
              <button
                key={t}
                type="button"
                className={"option" + (type === t ? " active" : "")}
                onClick={() => setType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">工作年限</label>
          <div className="option-row">
            {["实习", "应届", "1–3 年", "3 年以上"].map((y) => (
              <button
                key={y}
                type="button"
                className={"option" + (years === y ? " active" : "")}
                onClick={() => setYears(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="hint-box">
          <span className="hint-label">本次侧重</span>
          <span>{focusText}</span>
        </div>

        <Link
          className="btn btn-block"
          href={href}
          onClick={() => track("start_interview", { position, type, years })}
        >
          开始面试 →
        </Link>
        <p className="hint">共 5 题，约 10 分钟。不需要注册，不收集个人信息。</p>
      </section>

      <h2 className="section-title">覆盖方向</h2>
      <section className="chips">
        {INDUSTRIES.map((g) => (
          <span key={g.industry} className="chip">
            {g.industry}
          </span>
        ))}
      </section>

      <h2 className="section-title">怎么用</h2>
      <section className="steps-grid">
        <div className="step">
          <div className="step-num">1</div>
          <div className="step-title">选岗位</div>
          <p className="feature-desc">按行业选择目标岗位，再选业务面或 HR 面</p>
        </div>
        <div className="step">
          <div className="step-num">2</div>
          <div className="step-title">练 5 题</div>
          <p className="feature-desc">AI 连续追问，像真实面试一样答</p>
        </div>
        <div className="step">
          <div className="step-num">3</div>
          <div className="step-title">看报告</div>
          <p className="feature-desc">评分、逐题点评、参考答案一次给全</p>
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature">
          <div className="feature-num">{ALL_POSITIONS.length}</div>
          <div className="feature-title">个理工科岗位</div>
          <p className="feature-desc">覆盖 {INDUSTRIES.length} 大方向，按所选岗位出题</p>
        </div>
        <div className="feature">
          <div className="feature-num">2</div>
          <div className="feature-title">种面试类型</div>
          <p className="feature-desc">业务面看专业能力，HR 面看动机与稳定性</p>
        </div>
        <div className="feature">
          <div className="feature-num">0</div>
          <div className="feature-title">门槛</div>
          <p className="feature-desc">打开网页就能练，不用注册、不用装 App</p>
        </div>
      </section>

      <footer className="footer">个人项目 · Next.js + DeepSeek 搭建</footer>
    </main>
  );
}
