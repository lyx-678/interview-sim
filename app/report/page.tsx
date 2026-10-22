"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Dimension = { label: string; score: number };
type PerQuestion = {
  question: string;
  answer: string;
  score: number;
  comment: string;
  reference: string;
};
type Report = {
  position: string;
  type: string;
  years: string;
  score: number;
  level?: string;
  dimensions?: Dimension[];
  perQuestion?: PerQuestion[];
  weaknesses?: string[];
  suggestions?: string[];
};

function level(score: number) {
  if (score >= 85) return "good";
  if (score >= 75) return "ok";
  if (score >= 60) return "warn";
  return "bad";
}

function levelText(score: number) {
  if (score >= 85) return "优秀";
  if (score >= 75) return "良好";
  if (score >= 60) return "待提升";
  return "需加强";
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("interviewReport");
    if (raw) {
      try {
        setReport(JSON.parse(raw) as Report);
      } catch {
        setReport(null);
      }
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="container">
        <p className="muted">加载中…</p>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="container">
        <header className="page-header">
          <h1 className="title">面试报告</h1>
          <p className="subtitle">还没有面试记录</p>
        </header>
        <section className="card">
          <p>先去练一场面试，结束后这里会自动生成你的报告。</p>
          <Link className="btn" href="/">
            去开始一场面试 →
          </Link>
        </section>
      </main>
    );
  }

  const dimensions = report.dimensions ?? [];
  const perQuestion = report.perQuestion ?? [];
  const weaknesses = report.weaknesses ?? [];
  const suggestions = report.suggestions ?? [];
  const overallLevel = level(report.score);

  return (
    <main className="container">
      <header className="page-header">
        <h1 className="title">面试报告</h1>
        <p className="subtitle">
          {report.position} · {report.type} · {report.years}
        </p>
      </header>

      <section className={`score-card ${overallLevel}`}>
        <div className="score-num">{report.score}</div>
        <div>
          <div className="grade">{levelText(report.score)}</div>
          <p className="muted">本次面试综合评分</p>
        </div>
      </section>

      {dimensions.length > 0 && (
        <>
          <h2 className="section-title">维度评分</h2>
          <section className="card">
            <div className="dim-list">
              {dimensions.map((d) => (
                <div className="dim-row" key={d.label}>
                  <span>{d.label}</span>
                  <div className="dim-bar">
                    <div
                      className={`dim-fill ${level(d.score)}`}
                      style={{ width: `${Math.max(0, Math.min(100, d.score))}%` }}
                    />
                  </div>
                  <span className="dim-value">{d.score}</span>
                </div>
              ))}
            </div>

            <div className="legend">
              <span className="legend-item">
                <span className="dot good" />
                优秀 ≥ 85
              </span>
              <span className="legend-item">
                <span className="dot ok" />
                良好 75–84
              </span>
              <span className="legend-item">
                <span className="dot warn" />
                待提升 60–74
              </span>
              <span className="legend-item">
                <span className="dot bad" />
                需加强 &lt; 60
              </span>
            </div>
          </section>
        </>
      )}

      {perQuestion.length > 0 && (
        <>
          <h2 className="section-title">逐题点评</h2>
          {perQuestion.map((item, i) => (
            <div className="q-card" key={i}>
              <div className="q-head">
                <span className="q-index">Q{i + 1}</span>
                <span className="q-text">{item.question}</span>
                <span className={`score-pill ${level(item.score)}`}>{item.score}</span>
              </div>

              {item.answer && (
                <div className="q-block">
                  <div className="q-label">我的回答</div>
                  <p className="muted">{item.answer}</p>
                </div>
              )}

              <div className="q-block">
                <div className="q-label">AI 点评</div>
                <p>{item.comment}</p>
              </div>

              <div className="q-block">
                <div className="q-label">参考答案</div>
                <p className="muted">{item.reference}</p>
              </div>
            </div>
          ))}
        </>
      )}

      {weaknesses.length > 0 && (
        <section className="card insight-card warn">
          <h2 className="card-title">薄弱项</h2>
          <ul className="list list-dot list-warn">
            {weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      {suggestions.length > 0 && (
        <section className="card insight-card good">
          <h2 className="card-title">改进建议</h2>
          <ul className="list list-dot list-good">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="actions">
        <Link className="btn" href="/">
          再来一次
        </Link>
        <Link className="btn btn-ghost" href="/">
          回到首页
        </Link>
      </div>
    </main>
  );
}
