"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t(data.error) ?? t("regFailed"));
        return;
      }
      document.cookie = `token=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>{t("createAccount")}</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>{t("registerSub")}</p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="username">{t("username")}</label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">{t("email")}</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">{t("password")}</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
            {loading ? t("creating") : t("createAccount")}
          </button>
        </form>
        <p style={{ marginTop: 20, fontSize: 14, color: "var(--muted)", textAlign: "center" }}>
          {t("haveAccount")}{" "}
          <Link href="/login">{t("signInLink")}</Link>
        </p>
      </div>
    </div>
  );
}
