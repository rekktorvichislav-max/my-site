"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "./LanguageProvider";

function ShieldIcon() {
  return (
    <svg width="34" height="38" viewBox="0 0 24 28" fill="none" aria-hidden style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}>
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f2f2f2" />
          <stop offset="1" stopColor="#8f8f8f" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L21 6 V13 C21 19 17 23.5 12 26 C7 23.5 3 19 3 13 V6 Z"
        stroke="url(#shield-grad)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.1)"
      />
      <rect x="9" y="11.5" width="6" height="7" rx="1.2" stroke="url(#shield-grad)" strokeWidth="1.5" />
      <path d="M10.2 11.5 V9.2 a1.8 1.8 0 0 1 3.6 0 v2.3" stroke="url(#shield-grad)" strokeWidth="1.5" />
    </svg>
  );
}

export function Landing({
  loggedIn,
  hasDownload,
  drun,
  username,
}: {
  loggedIn: boolean;
  hasDownload?: boolean;
  drun?: boolean;
  username?: string;
}) {
  const { t, dict } = useLang();
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [downloadModal, setDownloadModal] = useState(false);
  const [fileName, setFileName] = useState("");

  const featureModules = [
    {
      title: t("featCombatTitle"),
      desc: t("featCombatDesc"),
      chips: ["Hit Aura", "Auto Totem", "Auto Swap", "Criticals", "Velocity", "Trigger Bot"],
      mods: [
        ["Hit Aura", t("modHitAura")],
        ["Auto Totem", t("modAutoTotem")],
        ["Auto Swap", t("modAutoSwap")],
        ["Criticals", t("modCriticals")],
        ["Velocity", t("modVelocity")],
        ["Trigger Bot", t("modTriggerBot")],
      ],
    },
    {
      title: t("featMovementTitle"),
      desc: t("featMovementDesc"),
      chips: ["Speed", "Long Jump", "Fly", "Elytra Booster", "Jesus", "Strafe"],
      mods: [
        ["Speed", t("modSpeed")],
        ["Long Jump", t("modLongJump")],
        ["Fly", t("modFly")],
        ["Elytra Booster", t("modElytraBooster")],
        ["Jesus", t("modJesus")],
        ["Strafe", t("modStrafe")],
      ],
    },
    {
      title: t("featPlayerTitle"),
      desc: t("featPlayerDesc"),
      chips: ["Auto Gapple", "Auto Brewer", "Apple Farm", "Chest Stealer", "Auto Armor", "Auto Tool"],
      mods: [
        ["Auto Gapple", t("modAutoGapple")],
        ["Auto Brewer", t("modAutoBrewer")],
        ["Apple Farm", t("modAppleFarm")],
        ["Chest Stealer", t("modChestStealer")],
        ["Auto Armor", t("modAutoArmor")],
        ["Auto Tool", t("modAutoTool")],
      ],
    },
    {
      title: t("featVisualTitle"),
      desc: t("featVisualDesc"),
      chips: ["ESP", "Target ESP", "Tracers", "NameTags", "Trails", "ViewModel"],
      mods: [
        ["ESP", t("modEsp")],
        ["Target ESP", t("modTargetEsp")],
        ["Tracers", t("modTracers")],
        ["NameTags", t("modNameTags")],
        ["Trails", t("modTrails")],
        ["ViewModel", t("modViewModel")],
      ],
    },
    {
      title: t("featHudTitle"),
      desc: t("featHudDesc"),
      chips: ["Hud", "Watermark", "Item Cooldown", "Arrows", "Crosshair", "Notifications"],
      mods: [
        ["Hud", t("modHud")],
        ["Watermark", t("modWatermark")],
        ["Item Cooldown", t("modItemCooldown")],
        ["Arrows", t("modArrows")],
        ["Crosshair", t("modCrosshair")],
        ["Notifications", t("modNotifications")],
      ],
    },
    {
      title: t("featProtectionTitle"),
      desc: t("featProtectionDesc"),
      chips: ["HWID", "License", "Devices"],
      mods: [
        ["HWID", t("modHwid")],
        ["License", t("modLicense")],
        ["Devices", t("modDevices")],
      ],
    },
  ];

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
          background: linear-gradient(90deg, #ffffff, #9a9a9a, #d5d5d5, #ffffff);
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
          background: "rgba(10,10,10,0.6)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, textShadow: "0 0 18px rgba(255,255,255,0.25)" }}>
          {drun && <span className="cotax-drunk-logo">🍺</span>}
          Cotax<span className="gradient-text">Client</span>
          {drun && <span className="cotax-drunk-logo">🍻</span>}
        </div>
        <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="#features" style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>
            {t("navFeatures")}
          </a>
          <a href="#pricing" style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>
            {t("navPricing")}
          </a>
          <a href="#download" style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>
            {t("navDownload")}
          </a>
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
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text)",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: "0 0 20px rgba(255,255,255,0.12)",
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

        <section id="features" style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 40px 80px", scrollMarginTop: 90 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800 }}>
              {t("featuresTitle")}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 10 }}>
              {t("featuresSub")}
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
              textAlign: "left",
            }}
          >
            {featureModules.map((f, i) => (
              <div
                key={f.title}
                className="card feature-card"
                role="button"
                tabIndex={0}
                onClick={() => setActiveFeature(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveFeature(i);
                  }
                }}
              >
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 14 }}>{f.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {f.chips.map((c) => (
                    <span key={c} className="module-chip">
                      <span className="dot" />
                      {c}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {t("featClickHint")}
                  <span style={{ transition: "transform 0.18s ease" }} className="feature-arrow">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {activeFeature !== null && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setActiveFeature(null)}
          >
              <div
                className="card feature-modal"
                style={{
                  maxWidth: 560,
                  width: "100%",
                  maxHeight: "82vh",
                  overflowY: "auto",
                  padding: "30px 28px",
                  borderColor: "rgba(255,255,255,0.4)",
                  boxShadow: "0 0 44px rgba(255,255,255,0.14)",
                }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <h3 style={{ fontSize: 26, fontWeight: 800 }}>{featureModules[activeFeature].title}</h3>
                <button
                  onClick={() => setActiveFeature(null)}
                  aria-label={t("featModalClose")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--muted)",
                    fontSize: 24,
                    lineHeight: 1,
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 20 }}>
                {featureModules[activeFeature].desc}
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                {featureModules[activeFeature].mods.map(([name, desc]) => (
                  <div
                    key={name}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span
                      className="module-chip"
                      style={{ flexShrink: 0, whiteSpace: "nowrap", marginTop: -1 }}
                    >
                      <span className="dot" />
                      {name}
                    </span>
                    <span style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.45 }}>{desc}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn btn-ghost"
                style={{ marginTop: 22, width: "100%" }}
                onClick={() => setActiveFeature(null)}
              >
                {t("featModalClose")}
              </button>
            </div>
          </div>
        )}

        <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 96px", scrollMarginTop: 90 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800 }}>{t("buyTitle")}</h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 10 }}>{t("buySub")}</p>
          </div>

          {[
            {
              key: "legit",
              name: t("buyLegitRow"),
              highlight: false,
              plans: [
                { dur: t("buyDuration30"), price: dict.buyPrices.legit[0], url: dict.buyLinks.legit30 },
                { dur: t("buyDuration90"), price: dict.buyPrices.legit[1], url: dict.buyLinks.legit90 },
                { dur: t("buyLifetime"), price: dict.buyPrices.legit[2], url: dict.buyLinks.legitLife },
              ],
            },
            {
              key: "beta",
              name: t("buyBetaRow"),
              highlight: true,
              plans: [
                { dur: t("buyDuration30"), price: dict.buyPrices.beta[0], url: dict.buyLinks.beta30 },
                { dur: t("buyDuration90"), price: dict.buyPrices.beta[1], url: dict.buyLinks.beta90 },
                { dur: t("buyLifetime"), price: dict.buyPrices.beta[2], url: dict.buyLinks.betaLife },
              ],
            },
          ].map((row) => (
            <div key={row.key} style={{ marginBottom: 40 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <h3 style={{ fontSize: 30, fontWeight: 800 }}>
                  <span className={row.highlight ? "gradient-text" : undefined}>{row.name}</span>
                </h3>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 20,
                }}
              >
                {row.plans.map((p) => (
                  <div
                    key={p.dur}
                    className="card"
                    style={{
                      padding: "24px 22px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      borderColor: row.highlight ? "rgba(255,255,255,0.3)" : "var(--border)",
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--muted)" }}>{p.dur}</div>
                    <div
                      style={{
                        fontSize: 34,
                        fontWeight: 800,
                        marginTop: 8,
                        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {p.price}
                    </div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{ marginTop: 18, width: "100%" }}
                    >
                      {t("buyBtn")}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section
          id="download"
          style={{ maxWidth: 820, margin: "0 auto", padding: "0 40px 96px", scrollMarginTop: 90 }}
        >
          <div className="card" style={{ padding: "44px 40px", textAlign: "center" }}>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>
              <span className="gradient-text">{t("downloadTitle")}</span>
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 16, marginTop: 12 }}>{t("downloadSub")}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
              {loggedIn && hasDownload ? (
                <>
                  <button className="btn btn-ghost" onClick={() => setDownloadModal(true)}>
                    {t("downloadLoaderBtn")}
                  </button>
                </>
              ) : loggedIn ? (
                <>
                  <Link href="/dashboard" className="btn btn-ghost">
                    {t("downloadGoCabinet")}
                  </Link>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      color: "var(--muted)",
                      fontSize: 14,
                    }}
                  >
                    {t("downloadNoSub")}
                  </span>
                </>
              ) : (
                <Link href="/login" className="btn">
                  {t("downloadToLogin")}
                </Link>
              )}
            </div>
          </div>
        </section>

        {downloadModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setDownloadModal(false)}
          >
            <div
              className="card"
              style={{
                maxWidth: 480,
                width: "100%",
                padding: "30px 28px",
                borderColor: "rgba(255,255,255,0.4)",
                boxShadow: "0 0 44px rgba(255,255,255,0.14)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800 }}>
                  <span className="gradient-text">{t("downloadLoaderTitle")}</span>
                </h3>
                <button
                  onClick={() => setDownloadModal(false)}
                  aria-label={t("downloadLoaderClose")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--muted)",
                    fontSize: 24,
                    lineHeight: 1,
                    padding: "4px 8px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.5 }}>{t("downloadLoaderSub")}</p>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={t("downloadNamePlaceholder")}
                maxLength={64}
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: 15,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--text)",
                  outline: "none",
                }}
              />
              <a
                href={fileName ? `/api/download?name=${encodeURIComponent(fileName)}` : "/api/download"}
                className="btn"
                style={{ marginTop: 18, width: "100%" }}
                onClick={() => setDownloadModal(false)}
              >
                {t("downloadJarBtn")}
              </a>
            </div>
          </div>
        )}
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
