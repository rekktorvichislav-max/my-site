"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { HudEditor } from "@/components/HudEditor";
import { SOCIAL } from "@/lib/social";

interface DashboardUser {
  id: number;
  uid: string | null;
  username: string;
  email: string;
  role: string;
  drun?: boolean;
  hwid: string | null;
  hwid_bound_at: number | null;
  created_at: number;
  last_login: number | null;
  subscriptions: {
    plan: string;
    from_beta?: boolean;
    granted_at?: number;
    expires_at?: number | null;
  }[];
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
  const [grantDays, setGrantDays] = useState<number | null>(30);
  const [adminMsg, setAdminMsg] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [resetUser, setResetUser] = useState("");
  const [resetUid, setResetUid] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetErr, setResetErr] = useState("");
  const [roleUser, setRoleUser] = useState("");
  const [roleValue, setRoleValue] = useState("user");
  const [roleUid, setRoleUid] = useState("");
  const [roleMsg, setRoleMsg] = useState("");
  const [roleErr, setRoleErr] = useState("");
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [announcing, setAnnouncing] = useState(false);
  const [announceMsg, setAnnounceMsg] = useState("");
  const [announceErr, setAnnounceErr] = useState("");
  const [announceActive, setAnnounceActive] = useState(false);
  const [clientModal, setClientModal] = useState(false);
  const [fileName, setFileName] = useState("");

  async function announce() {
    setAnnounceMsg("");
    setAnnounceErr("");
    setAnnouncing(true);
    try {
      const res = await fetch("/api/admin/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnnounceErr(t(data.error) ?? t("announceFailed"));
        return;
      }
      setAnnounceActive(true);
      setAnnounceMsg(t("announceSent"));
    } catch {
      setAnnounceErr(t("networkError"));
    } finally {
      setAnnouncing(false);
    }
  }

  async function clearAnnounce() {
    setAnnounceMsg("");
    setAnnounceErr("");
    setAnnouncing(true);
    try {
      const res = await fetch("/api/admin/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnnounceErr(t(data.error) ?? t("announceFailed"));
        return;
      }
      setAnnounceActive(false);
      setAnnounceMsg(t("announceCleared"));
    } catch {
      setAnnounceErr(t("networkError"));
    } finally {
      setAnnouncing(false);
    }
  }

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

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg("");
    setPwdErr("");
    if (newPwd !== confPwd) {
      setPwdErr(t("Passwords do not match"));
      return;
    }
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd, confirmPassword: confPwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdErr(t(data.error) ?? t("passwordChangeFailed"));
        return;
      }
      setPwdMsg(t("passwordChanged"));
      setCurPwd("");
      setNewPwd("");
      setConfPwd("");
    } catch {
      setPwdErr(t("networkError"));
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
        body: JSON.stringify({ username: grantUser, plan: grantPlan, action: "grant", days: grantDays }),
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

  async function roleAction(action: string, extra?: Record<string, unknown>) {
    setRoleMsg("");
    setRoleErr("");
    try {
      const res = await fetch("/api/admin/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: roleUser, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRoleErr(t(data.error) ?? t("roleFailed"));
        return;
      }
      if (action === "set-role") setRoleMsg(t("roleSet", { role: roleValue, user: roleUser }));
      else if (action === "set-drun") setRoleMsg(t("drunSet", { value: data.drun ? "on" : "off", user: roleUser }));
      else if (action === "set-uid") setRoleMsg(t("uidSet", { uid: roleUid, user: roleUser }));
      else if (action === "delete") {
        setRoleMsg(t("userDeleted", { user: roleUser }));
        setRoleUser("");
        setRoleUid("");
      }
    } catch {
      setRoleErr(t("networkError"));
    }
  }

  async function toggleDrun() {
    if (!roleUser) return;
    setRoleMsg("");
    setRoleErr("");
    try {
      const res = await fetch("/api/admin/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: roleUser, action: "get" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRoleErr(t(data.error) ?? t("roleFailed"));
        return;
      }
      roleAction("set-drun", { drun: !data.user?.drun });
    } catch {
      setRoleErr(t("networkError"));
    }
  }

  function deleteUserAction() {
    if (!roleUser) return;
    if (confirm(`Delete user "${roleUser}"? This cannot be undone.`)) {
      roleAction("delete");
    }
  }

  const fmt = (ts: number | null) =>
    ts ? new Date(ts).toLocaleString() : "—";

  const subFor = (plan: string) => user.subscriptions?.find((s) => s.plan === plan);

  const fmtExpiry = (plan: string) => {
    const sub = subFor(plan);
    if (!sub) return null;
    return sub.expires_at ? fmt(sub.expires_at) : t("subPerpetual");
  };

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
        color: tab === key ? "var(--bg)" : "var(--muted)",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh" }} className={user.drun ? "cotax-drunk-page" : undefined}>
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
            {user.drun && <span className="cotax-drunk-logo">🍺</span>}
            Cotax<span className="gradient-text">Client</span>
            {user.drun && <span className="cotax-drunk-logo">🍻</span>}
          </Link>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            {user.username}
            {user.role === "admin" && <span style={{ color: "var(--accent2)", marginLeft: 6 }}>admin</span>}
            {user.drun && <span style={{ color: "var(--accent2)", marginLeft: 6 }}>drun</span>}
          </span>
          <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 13 }} onClick={logout}>
            {t("logout")}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
          {tabBtn("cabinet", t("cabinetTab"))}
          {tabBtn("devices", t("devicesTab"))}
        </div>

        {tab === "cabinet" && (
          <div className="cabinet-grid">
            <aside style={{ position: "sticky", top: 20, display: "grid", gap: 12 }}>
            <div className="card" style={{ padding: "16px 18px" }}>
              <h2 style={{ fontSize: 15, marginBottom: 10 }}>{t("subscriptions")}</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {["legit", "beta"].map((plan) => {
                  const active = !!subFor(plan);
                  const expiry = fmtExpiry(plan);
                  return (
                    <div
                      key={plan}
                      style={{
                        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 10,
                        padding: "12px 14px",
                        background: active
                          ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"
                          : "var(--bg2)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{t(plan)}</span>
                        {active && (
                          <span style={{ color: "var(--success)", fontSize: 12 }}>{t("active")}</span>
                        )}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{t(`${plan}Desc`)}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                        {active ? `${t("subUntil")}: ${expiry}` : t("noSubscription")}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!user.subscriptions?.length && (
                <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
                  {t("noSubscription")}
                </p>
              )}
            </div>
            </aside>

            <div>
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
              <h2 style={{ fontSize: 16, marginBottom: 10 }}>{t("changePassword")}</h2>
              <form onSubmit={changePassword} style={{ display: "grid", gap: 10 }}>
                <div className="field">
                  <label htmlFor="curPwd">{t("currentPassword")}</label>
                  <input
                    id="curPwd"
                    className="input"
                    type="password"
                    value={curPwd}
                    onChange={(e) => setCurPwd(e.target.value)}
                    autoComplete="current-password"
                    style={{ padding: "8px 10px", fontSize: 13 }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="newPwd">{t("newPassword")}</label>
                  <input
                    id="newPwd"
                    className="input"
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    autoComplete="new-password"
                    style={{ padding: "8px 10px", fontSize: 13 }}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="confPwd">{t("confirmPassword")}</label>
                  <input
                    id="confPwd"
                    className="input"
                    type="password"
                    value={confPwd}
                    onChange={(e) => setConfPwd(e.target.value)}
                    autoComplete="new-password"
                    style={{ padding: "8px 10px", fontSize: 13 }}
                    required
                  />
                </div>
                <div>
                  <button className="btn" style={{ padding: "8px 14px", fontSize: 13 }}>
                    {t("changePasswordBtn")}
                  </button>
                </div>
                {pwdErr && <div className="error" style={{ fontSize: 13 }}>{pwdErr}</div>}
                {pwdMsg && (
                  <div style={{ color: "var(--success)", fontSize: 13 }}>{pwdMsg}</div>
                )}
              </form>
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
                  <div className="field" style={{ marginBottom: 8 }}>
                    <label htmlFor="gdays">{t("duration")}</label>
                    <select
                      id="gdays"
                      className="input"
                      value={grantDays === null ? "forever" : String(grantDays)}
                      onChange={(e) => setGrantDays(e.target.value === "forever" ? null : Number(e.target.value))}
                      style={{ minWidth: 110, padding: "8px 10px", fontSize: 13 }}
                    >
                      <option value="1">{t("buyDuration1")}</option>
                      <option value="7">{t("buyDuration7")}</option>
                      <option value="30">{t("buyDuration30")}</option>
                      <option value="60">60 {t("days")}</option>
                      <option value="90">{t("buyDuration90")}</option>
                      <option value="180">180 {t("days")}</option>
                      <option value="365">365 {t("days")}</option>
                      <option value="forever">{t("subPerpetual")}</option>
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

            {(user.role === "admin" && user.username === "Lake") && (
              <div className="card" style={cardStyle}>
                <h2 style={{ fontSize: 16, marginBottom: 6 }}>{t("adminRoles")}</h2>
                <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
                  {t("adminRolesDesc")}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div className="field" style={{ flex: 1, minWidth: 140, marginBottom: 8 }}>
                    <label htmlFor="rluser">{t("targetUser")}</label>
                    <input
                      id="rluser"
                      className="input"
                      value={roleUser}
                      onChange={(e) => setRoleUser(e.target.value)}
                      placeholder="e.g. some_user"
                      style={{ padding: "8px 10px", fontSize: 13 }}
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 8 }}>
                    <label htmlFor="rlrole">{t("roleLabel")}</label>
                    <select
                      id="rlrole"
                      className="input"
                      value={roleValue}
                      onChange={(e) => setRoleValue(e.target.value)}
                      style={{ minWidth: 90, padding: "8px 10px", fontSize: 13 }}
                    >
                      <option value="user">{t("roleUser")}</option>
                      <option value="admin">{t("roleAdmin")}</option>
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 8 }}>
                    <label htmlFor="rluid">{t("uidLabel")}</label>
                    <input
                      id="rluid"
                      className="input"
                      value={roleUid}
                      onChange={(e) => setRoleUid(e.target.value)}
                      placeholder="00000"
                      style={{ fontFamily: "monospace", width: 90, padding: "8px 10px", fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    <button className="btn" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => roleAction("set-role", { role: roleValue })}>
                      {t("setRole")}
                    </button>
                    <button className="btn" style={{ padding: "8px 14px", fontSize: 13 }} onClick={toggleDrun}>
                      {t("toggleDrun")}
                    </button>
                    <button
                      className="btn"
                      style={{ padding: "8px 14px", fontSize: 13 }}
                      onClick={() => roleUid && roleAction("set-uid", { uid: roleUid })}
                    >
                      {t("setUid")}
                    </button>
                    <button className="btn btn-danger" style={{ padding: "8px 14px", fontSize: 13 }} onClick={deleteUserAction}>
                      {t("deleteUserBtn")}
                    </button>
                  </div>
                </div>
                {roleErr && <div className="error" style={{ marginTop: 6, fontSize: 13 }}>{roleErr}</div>}
                {roleMsg && (
                  <div style={{ color: "var(--success)", fontSize: 13, marginTop: 6 }}>{roleMsg}</div>
                )}
              </div>
            )}

            {user.username === "Lake" && (
              <div className="card" style={cardStyle}>
                <h2 style={{ fontSize: 16, marginBottom: 6 }}>{t("announceTitle")}</h2>
                <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
                  {t("announceDesc")}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    className="btn"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                    disabled={announcing}
                    onClick={announce}
                  >
                    {announcing ? t("announceSending") : t("announceNotify")}
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                    disabled={announcing}
                    onClick={clearAnnounce}
                  >
                    {t("announceClear")}
                  </button>
                  {announceActive && (
                    <span style={{ color: "var(--success)", fontSize: 13 }}>
                      {t("announceActiveLabel")}
                    </span>
                  )}
                </div>
                {announceMsg && <div style={{ color: "var(--success)", fontSize: 13, marginTop: 6 }}>{announceMsg}</div>}
                {announceErr && <div className="error" style={{ marginTop: 6, fontSize: 13 }}>{announceErr}</div>}
              </div>
            )}

            <div className="card" style={cardStyle}>
              <h2 style={{ fontSize: 16, marginBottom: 6 }}>{t("download")}</h2>
              {user.subscriptions?.length || user.role === "admin" ? (
                <>
                  <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>
                    {t("downloadDesc")}
                  </p>
                  <button className="btn" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => setClientModal(true)}>
                    {t("downloadClient")}
                  </button>
                </>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  {t("noSubDownload")}
                </p>
              )}
            </div>
            </div>

            <aside style={{ position: "sticky", top: 20, display: "grid", gap: 12 }}>
              <div className="card" style={{ padding: "16px 18px" }}>
                <h2 style={{ fontSize: 15, marginBottom: 6 }}>{t("contacts")}</h2>
                <p style={{ color: "var(--muted)", fontSize: 12, marginBottom: 12 }}>{t("contactsDesc")}</p>
                <div style={{ display: "grid", gap: 8 }}>
                  <a
                    href={SOCIAL.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-link"
                  >
                    <span className="contact-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M21.9 4.3a1.2 1.2 0 0 0-1.6-.9L2.6 9.7c-1 .4-1 1.8 0 2.2l4 1.3 1.5 4.7c.3.9 1.4 1.1 2 .5l2-1.8 3.8 2.8c.8.6 2 .2 2.2-.9l3.8-14.1a.8.8 0 0 0 0-.2l.2-.1Z" />
                      </svg>
                    </span>
                    {t("telegram")}
                  </a>
                  <a
                    href={SOCIAL.discord}
                    target="_blank"
                    rel="noreferrer"
                    className="contact-link"
                  >
                    <span className="contact-icon" aria-hidden>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.5 1a18.3 18.3 0 0 0-5.8 0L8.6 3a19.8 19.8 0 0 0-4.9 1.5A20.4 20.4 0 0 0 .3 17.6a19.9 19.9 0 0 0 6 3l1.3-2a13 13 0 0 1-2-1l.5-.4a14.3 14.3 0 0 0 12 0l.5.4a13 13 0 0 1-2 1l1.3 2a19.9 19.9 0 0 0 6-3A20.2 20.2 0 0 0 20.3 4.4ZM8.7 15c-.9 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2Zm6.6 0c-.9 0-1.7-.9-1.7-2s.8-2 1.7-2 1.7.9 1.7 2-.8 2-1.7 2Z" />
                      </svg>
                    </span>
                    {t("discord")}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        )}

        {clientModal && (
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
            onClick={() => setClientModal(false)}
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
                  <span className="gradient-text">{t("downloadClient")}</span>
                </h3>
                <button
                  onClick={() => setClientModal(false)}
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
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.5 }}>{t("downloadDesc")}</p>
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
                onClick={() => setClientModal(false)}
              >
                {t("downloadClient")}
              </a>
            </div>
          </div>
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

      {user.drun && (
        <>
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
              font-size: 22px;
              font-weight: 900;
              text-align: center;
              margin-bottom: 14px;
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
          <div style={{ padding: "10px 16px", textAlign: "center" }}>
            <div>
              <span style={{ fontSize: 22 }}>🍺</span>
              <span className="cotax-drunk-title" style={{ margin: "0 8px" }}>
                Ты в подпитии, {user.username}!
              </span>
              <span style={{ fontSize: 22 }}>🍻</span>
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Упс! Тебе выдали роль drun 🥴 Не забудь выспаться. 😵‍💫
            </div>
          </div>
        </>
      )}
    </div>
  );
}
