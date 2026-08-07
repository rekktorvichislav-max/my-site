"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { HudEditor } from "@/components/HudEditor";

interface DashboardUser {
  id: number;
  uid: string | null;
  username: string;
  email: string;
  role: string;
  hwid: string | null;
  hwid_bound_at: number | null;
  created_at: number;
  last_login: number | null;
  subscriptions: string[];
}

interface Device {
  id: number;
  user_id: number;
  hwid: string;
  first_seen_at: number;
  last_seen_at: number;
  ip: string | null;
}

const cardStyle: React.CSSProperties = { padding: "14px 16px", marginBottom: 12 };

export function Dashboard({ user, devices }: { user: DashboardUser; devices: Device[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLang();
  const [tab, setTab] = useState<"cabinet" | "devices">(
    searchParams.get("tab") === "devices" ? "devices" : "cabinet"
  );
  const [grantUser, setGrantUser] = useState("");
  const [grantPlan, setGrantPlan] = useState("legit");
  const [adminMsg, setAdminMsg] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [resetUser, setResetUser] = useState("");
  const [resetUid, setResetUid] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetErr, setResetErr] = useState("");

  async function resetHwidAdmin(e: React.FormEvent) {
    e.preventDefault();
    setResetMsg("");
    setResetErr("");
    try {
      const res = await fetch("/api/admin/reset-hwid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: resetUser, uid: resetUid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetErr(t(data.error) ?? t("resetFailed"));
        return;
      }
      setResetMsg(t("resetSuccess", { user: resetUser }));
      setResetUser("");
      setResetUid("");
    } catch {
      setResetErr("Network error");
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
    router.refresh();
  }

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    setAdminMsg("");
    setAdminErr("");
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: grantUser, plan: grantPlan, action: "grant" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminErr(t(data.error) ?? t("grantFailed"));
        return;
      }
      setAdminMsg(t("grantedSuccess", { plan: grantPlan, user: grantUser }));
      setGrantUser("");
    } catch {
      setAdminErr(t("networkError"));
    }
  }

  async function revoke(plan: string) {
    setAdminMsg("");
    setAdminErr("");
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: grantUser, plan, action: "revoke" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminErr(t(data.error) ?? t("revokeFailed"));
        return;
      }
      setAdminMsg(t("revokedSuccess", { plan, user: grantUser }));
    } catch {
      setAdminErr(t("networkError"));
    }
  }

  const fmt = (ts: number | null) =>
    ts ? new Date(ts).toLocaleString() : "—";

  const tabBtn = (key: "cabinet" | "devices", label: string) => (
    <button
      key={key}
      onClick={() => {
        setTab(key);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", key);
        router.replace(`${pathname}?${params.toString()}`);
      }}
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        border: "none",
        background: tab === key ? "var(--accent)" : "transparent",
        color: tab === key ? "#fff" : "var(--muted)",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <HudEditor userId={user.id} username={user.username} uid={user.uid} />
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          <Link href="/" style={{ color: "var(--text)" }}>
            Cotax<span className="gradient-text">Client</span>
          </Link>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            {user.username}
            {user.role === "admin" && <span style={{ color: "var(--accent2)", marginLeft: 6 }}>admin</span>}
          </span>
          <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }} onClick={logout}>
            {t("logout")}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
          {tabBtn("cabinet", t("cabinetTab"))}
          {tabBtn("devices", t("devicesTab"))}
        </div>

        {tab === "cabinet" && (
          <>
            <div className="card" style={cardStyle}>
              <h2 style={{ fontSize: 16, marginBottom: 10 }}>{t("account")}</h2>
              <div style={{ display: "grid", gap: 4, color: "var(--muted)", fontSize: 13 }}>
                <div>
                  {t("usernameLabel")}: <span style={{ color: "var(--text)" }}>{user.username}</span>
                </div>
                <div>
                  {t("uidLabel")}: <span style={{ color: "var(--text)", fontFamily: "monospace" }}>{user.uid}</span>
                </div>
                <div>
                  {t("emailLabel")}: <span style={{ color: "var(--text)" }}>{user.email}</span>
                </div>
                <div>
                  {t("registered")}: <span style={{ color: "var(--text)" }}>{fmt(user.created_at)}</span>
                </div>
                <div>
                  {t("lastLogin")}: <span style={{ color: "var(--text)" }}>{fmt(user.last_login)}</span>
                </div>
              </div>
            </div>

            <div className="card" style={cardStyle}>
              <h2 style={{ fontSize: 16, marginBottom: 8 }}>HWID</h2>
              {user.hwid ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
                  <span style={{ color: "var(--text)", fontSize: 14 }}>{t("hwidBound")}</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{t("bound")} {fmt(user.hwid_bound_at)}</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--muted)" }} />
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>{t("hwidNotBound")}</span>
                </div>
              )}
            </div>

            <div className="card" style={cardStyle}>
              <h2 style={{ fontSize: 16, marginBottom: 10 }}>{t("subscriptions")}</h2>
              <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>{t("subscriptionsManual")}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {["legit", "beta"].map((plan) => {
                  const active = user.subscriptions?.includes(plan);
                  return (
                    <div
                      key={plan}
                      style={{
                        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        minWidth: 140,
                        background: active ? "rgba(114,199,255,0.06)" : "var(--bg2)",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                        {t(plan)}
                        {active && (
                          <span style={{ color: "var(--success)", marginLeft: 6, fontSize: 12 }}>{t("active")}</span>
                        )}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{t(`${plan}Desc`)}</div>
                    </div>
                  );
                })}
              </div>
              {!user.subscriptions?.length && (
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  {t("noSubscription")}
                </p>
              )}
            </div>

            {user.role === "admin" && (
              <div className="card" style={cardStyle}>
                <h2 style={{ fontSize: 16, marginBottom: 6 }}>{t("adminGrant")}</h2>
                <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
                  {t("adminGrantDesc")}
                </p>
                <form onSubmit={grant} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div className="field" style={{ flex: 1, minWidth: 140, marginBottom: 8 }}>
                    <label htmlFor="guser">{t("username")}</label>
                    <input
                      id="guser"
                      className="input"
                      value={grantUser}
                      onChange={(e) => setGrantUser(e.target.value)}
                      placeholder="e.g. Lake"
                      style={{ padding: "8px 10px", fontSize: 13 }}
                      required
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 8 }}>
                    <label htmlFor="gplan">{t("plan")}</label>
                    <select
                      id="gplan"
                      className="input"
                      value={grantPlan}
                      onChange={(e) => setGrantPlan(e.target.value)}
                      style={{ minWidth: 100, padding: "8px 10px", fontSize: 13 }}
                    >
                      <option value="legit">{t("legit")}</option>
                      <option value="beta">{t("beta")}</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <button className="btn" style={{ padding: "8px 14px", fontSize: 13 }}>
                      {t("grant")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: "8px 14px", fontSize: 13 }}
                      onClick={() => grantUser && revoke(grantPlan)}
                    >
                      {t("revoke")}
                    </button>
                  </div>
                </form>
                {adminErr && <div className="error" style={{ marginTop: 6, fontSize: 13 }}>{adminErr}</div>}
                {adminMsg && (
                  <div style={{ color: "var(--success)", fontSize: 13, marginTop: 6 }}>{adminMsg}</div>
                )}
              </div>
            )}

            {user.role === "admin" && (
              <div className="card" style={cardStyle}>
                <h2 style={{ fontSize: 16, marginBottom: 6 }}>{t("adminReset")}</h2>
                <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
                  {t("adminResetDesc")}
                </p>
                <form onSubmit={resetHwidAdmin} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div className="field" style={{ flex: 1, minWidth: 140, marginBottom: 8 }}>
                    <label htmlFor="ruser">{t("username")}</label>
                    <input
                      id="ruser"
                      className="input"
                      value={resetUser}
                      onChange={(e) => setResetUser(e.target.value)}
                      placeholder="e.g. Lake"
                      style={{ padding: "8px 10px", fontSize: 13 }}
                      required
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 8 }}>
                    <label htmlFor="ruid">{t("uidLabel")}</label>
                    <input
                      id="ruid"
                      className="input"
                      value={resetUid}
                      onChange={(e) => setResetUid(e.target.value)}
                      placeholder="e.g. 00000"
                      style={{ fontFamily: "monospace", padding: "8px 10px", fontSize: 13 }}
                      required
                    />
                  </div>
                  <button className="btn btn-danger" style={{ padding: "8px 14px", fontSize: 13, marginBottom: 8 }}>
                    {t("resetHwid")}
                  </button>
                </form>
                {resetErr && <div className="error" style={{ marginTop: 6, fontSize: 13 }}>{resetErr}</div>}
                {resetMsg && (
                  <div style={{ color: "var(--success)", fontSize: 13, marginTop: 6 }}>{resetMsg}</div>
                )}
              </div>
            )}

            <div className="card" style={cardStyle}>
              <h2 style={{ fontSize: 16, marginBottom: 6 }}>{t("download")}</h2>
              {user.subscriptions?.length ? (
                <>
                  <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
                    {t("downloadDesc")}
                  </p>
                  <Link href="/api/download" className="btn" style={{ padding: "8px 16px", fontSize: 13 }}>
                    {t("downloadClient")}
                  </Link>
                </>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  {t("noSubDownload")}
                </p>
              )}
            </div>
          </>
        )}

        {tab === "devices" && (
          <div className="card" style={cardStyle}>
            <h2 style={{ fontSize: 16, marginBottom: 10 }}>{t("devicesTab")}</h2>
            <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
              {t("devicesDesc")}
            </p>
            {devices.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                {t("noDevices")}
              </p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {devices.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                      background: "var(--bg2)",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: 13 }}>
                        {d.hwid}
                        {user.hwid === d.hwid && (
                          <span style={{ color: "var(--success)", marginLeft: 8, fontSize: 12, fontFamily: "inherit" }}>
                            {t("boundBadge")}
                          </span>
                        )}
                      </div>
                      {d.ip && <div style={{ color: "var(--muted)", fontSize: 12 }}>{t("ip")} {d.ip}</div>}
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12, color: "var(--muted)" }}>
                      <div>{t("firstSeen")} {fmt(d.first_seen_at)}</div>
                      <div>{t("lastSeen")} {fmt(d.last_seen_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
