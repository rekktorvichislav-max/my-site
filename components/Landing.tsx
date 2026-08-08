"use client";

import Link from "next/link";
import { useLang } from "./LanguageProvider";

function ShieldIcon() {
  return (
    <svg width="34" height="38" viewBox="0 0 24 28" fill="none" aria-hidden style={{ filter: "drop-shadow(0 0 10px rgba(124,92,255,0.6))" }}>
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c5cff" />
          <stop offset="1" stopColor="#ff5c8a" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L21 6 V13 C21 19 17 23.5 12 26 C7 23.5 3 19 3 13 V6 Z"
        stroke="url(#shield-grad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="rgba(124,92,255,0.14)"
      />
      <rect x="9" y="11.5" width="6" height="7" rx="1.2" stroke="url(#shield-grad)" strokeWidth="1.5" />
      <path d="M10.2 11.5 V9.2 a1.8 1.8 0 0 1 3.6 0 v2.3" stroke="url(#shield-grad)" strokeWidth="1.5" />
    </svg>
  );
}

export function Landing({ loggedIn, drun, username }: { loggedIn: boolean; drun?: boolean; username?: string }) {
  const { t } = useLang();

  const stats = [
    { icon: <ShieldIcon />, label: t("statProtection") },
    { value: "1.21.11", label: t("statFabric") },
    { value: "≤1%", label: t("statFps") },
  ];

  return (
    <div className={drun ? "cotax-drunk-page" : undefined}>
      <style>{`
        @keyframes cotax-wobble {
          0%, 100% { transform: rotate(0deg) translate(0, 0); }
          25% { transform: rotate(-0.9deg) translate(6px, -8px); }
          50% { transform: rotate(0.7deg) translate(-8px, 10px); }
          75% { transform: rotate(-0.6deg) translate(8px, 6px); }
        }
        @keyframes cotax-fly-a {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          12% { transform: translate(26px, -20px) rotate(8deg); }
          28% { transform: translate(-30px, 18px) rotate(-12deg); }
          44% { transform: translate(22px, 28px) rotate(6deg); }
          62% { transform: translate(-18px, -30px) rotate(-6deg); }
          80% { transform: translate(28px, 14px) rotate(10deg); }
        }
        @keyframes cotax-fly-b {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          18% { transform: translate(-34px, 16px) rotate(-9deg); }
          36% { transform: translate(24px, -26px) rotate(11deg); }
          54% { transform: translate(-20px, 22px) rotate(-5deg); }
          72% { transform: translate(32px, -14px) rotate(7deg); }
        }
        @keyframes cotax-fly-c {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          14% { transform: translate(20px, 24px) rotate(7deg); }
          33% { transform: translate(-26px, -18px) rotate(-11deg); }
          55% { transform: translate(30px, 12px) rotate(9deg); }
          76% { transform: translate(-24px, 20px) rotate(-7deg); }
        }
        @keyframes cotax-fly-d {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-22px, -26px) rotate(10deg); }
          42% { transform: translate(28px, 16px) rotate(-8deg); }
          64% { transform: translate(-16px, 24px) rotate(6deg); }
          84% { transform: translate(24px, -22px) rotate(-10deg); }
        }
        @keyframes cotax-fly-e {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          16% { transform: translate(32px, 10px) rotate(-7deg); }
          38% { transform: translate(-28px, -24px) rotate(9deg); }
          60% { transform: translate(18px, 20px) rotate(-9deg); }
          82% { transform: translate(-26px, -14px) rotate(8deg); }
        }
        @keyframes cotax-fly-f {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          22% { transform: translate(-14px, 30px) rotate(6deg); }
          45% { transform: translate(34px, -20px) rotate(-6deg); }
          68% { transform: translate(-22px, -28px) rotate(12deg); }
          86% { transform: translate(16px, 18px) rotate(-4deg); }
        }
        @keyframes cotax-rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        .cotax-drunk-page {
          animation: cotax-wobble 3.4s ease-in-out infinite;
        }
        .cotax-drunk-page * {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .cotax-drunk-page *:nth-child(3n+1) { animation-name: cotax-fly-a; animation-duration: 2.1s; }
        .cotax-drunk-page *:nth-child(3n+2) { animation-name: cotax-fly-b; animation-duration: 2.7s; }
        .cotax-drunk-page *:nth-child(3n)   { animation-name: cotax-fly-c; animation-duration: 2.3s; }
        .cotax-drunk-page *:nth-child(4n)   { animation-name: cotax-fly-d; animation-duration: 3.0s; }
        .cotax-drunk-page *:nth-child(5n)   { animation-name: cotax-fly-e; animation-duration: 1.8s; }
        .cotax-drunk-page *:nth-child(7n)   { animation-name: cotax-fly-f; animation-duration: 2.5s; }
        .cotax-drunk-page *:nth-child(odd)  { animation-delay: -0.7s; }
        .cotax-drunk-page *:nth-child(2n)   { animation-delay: -1.4s; }
        .cotax-drunk-page .cotax-drunk-title {
          font-size: 20px;
          font-weight: 900;
          text-align: center;
          padding: 10px 16px;
          background: linear-gradient(90deg, #ff5c8a, #7c5cff, #5cff9b, #ff5c8a);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: cotax-fly-c 2.3s ease-in-out infinite, cotax-rainbow 3s linear infinite;
        }
        .cotax-drunk-logo {
          display: inline-block;
          animation-name: cotax-fly-e;
          animation-duration: 0.9s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
      {drun && (
        <div style={{ padding: "10px 16px", textAlign: "center" }}>
          <div>
            <span style={{ fontSize: 22 }}>🍺</span>
            <span className="cotax-drunk-title" style={{ margin: "0 8px" }}>
              Ты в подпитии, {username}!
            </span>
            <span style={{ fontSize: 22 }}>🍻</span>
          </div>
        </div>
      )}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(10,10,15,0.6)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, textShadow: "0 0 18px rgba(124,92,255,0.5)" }}>
          {drun && <span className="cotax-drunk-logo">🍺</span>}
          Cotax<span className="gradient-text">Client</span>
          {drun && <span className="cotax-drunk-logo">🍻</span>}
        </div>
        <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {loggedIn ? (
            <a href="/api/logout" className="btn btn-ghost" style={{ padding: "8px 16px" }}>
              {t("logout")}
            </a>
          ) : (
            <Link href="/register" className="btn" style={{ padding: "8px 16px" }}>
              {t("register")}
            </Link>
          )}
        </nav>
      </header>

      <main>
        <section style={{ position: "relative", overflow: "hidden" }}>
          <div
            className="block-grid"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          />
          <div
            style={{
              position: "relative",
              maxWidth: 1000,
              margin: "0 auto",
              padding: "96px 40px 64px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                border: "1px solid rgba(124,92,255,0.4)",
                background: "rgba(124,92,255,0.08)",
                color: "var(--text)",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 0 20px rgba(124,92,255,0.2)",
                marginBottom: 24,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 10px var(--success)" }} />
              Fabric 1.21.11 · v1.0
            </div>

            <h1 style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.05 }}>
              {t("tagline1")}
              <br />
              <span className="gradient-text glow-text">{t("tagline2")}</span>
            </h1>
            <p
              style={{
                color: "var(--muted)",
                fontSize: 18,
                marginTop: 24,
                maxWidth: 660,
                marginInline: "auto",
                lineHeight: 1.6,
              }}
            >
              {t("heroDesc")}
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 36 }}>
              {loggedIn ? (
                <Link href="/dashboard" className="btn">
                  {t("cabinet")}
                </Link>
              ) : (
                <Link href="/login" className="btn">
                  {t("login")}
                </Link>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 16,
                maxWidth: 640,
                margin: "56px auto 0",
              }}
            >
              {stats.map((s, i) => (
                <div key={i} className="card" style={{ padding: "18px 12px" }}>
                  {s.icon ? (
                    <div style={{ display: "flex", justifyContent: "center" }}>{s.icon}</div>
                  ) : (
                    <div className="stat-value">{s.value}</div>
                  )}
                  <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 40px 80px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              textAlign: "left",
            }}
          >
            {[
              { title: t("feat1Title"), desc: t("feat1Desc") },
              { title: t("feat2Title"), desc: t("feat2Desc") },
              { title: t("feat3Title"), desc: t("feat3Desc") },
            ].map((f) => (
              <div key={f.title} className="card">
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 15 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "24px 40px",
          color: "var(--muted)",
          fontSize: 14,
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} Cotax Client. {t("rightsReserved")}
      </footer>
    </div>
  );
}
