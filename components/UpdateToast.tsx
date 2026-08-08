"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cotax_seen_client_version";

export function UpdateToast() {
  const [version, setVersion] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/client/version")
      .then((r) => r.json())
      .then((data: { version?: string }) => {
        if (!mounted || !data.version) return;
        const seen = localStorage.getItem(STORAGE_KEY);
        if (seen !== data.version) {
          setVersion(data.version);
          setTimeout(() => setShow(true), 1200);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!show || !version) return null;

  const dismiss = (remember = false) => {
    if (remember) {
      try {
        localStorage.setItem(STORAGE_KEY, version);
      } catch {
        // ignore
      }
    }
    setShow(false);
  };

  return (
    <div
      onClick={() => dismiss(true)}
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 9999,
        cursor: "pointer",
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        border: "1px solid rgba(124, 92, 255, 0.4)",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        padding: "14px 18px",
        maxWidth: 320,
        color: "#fff",
        animation: "cotax-toast-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <style>{`
        @keyframes cotax-toast-in {
          0% { transform: translateY(40px) scale(0.85); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cotax-toast-glow {
          0%, 100% { box-shadow: 0 8px 24px rgba(124, 92, 255, 0.35); }
          50% { box-shadow: 0 8px 34px rgba(92, 255, 155, 0.5); }
        }
      `}</style>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, animation: "cotax-toast-glow 2s ease-in-out infinite" }}>
        🚀 Вышло обновление!
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 10 }}>
        Новая версия клиента доступна: <b style={{ fontFamily: "monospace" }}>{version}</b>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Link
          href="/api/download"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 8,
            background: "linear-gradient(90deg, #7c5cff, #5cff9b)",
            color: "#000",
            fontWeight: 800,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Скачать клиент
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dismiss(false);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "#fff",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Позже
        </button>
      </div>
    </div>
  );
}
