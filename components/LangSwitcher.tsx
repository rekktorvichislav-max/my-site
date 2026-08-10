"use client";

import { useRouter } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { LANGS } from "@/lib/i18n";

export function LangSwitcher() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const current = LANGS.find((l) => l.code === lang)!;
  const next = LANGS.find((l) => l.code !== lang)!;

  function toggle() {
    setLang(next.code);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      title={next.label}
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: "rgba(28,28,28,0.85)",
        backdropFilter: "blur(6px)",
        color: "var(--text)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        transition: "border-color 0.15s ease",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{current.flag}</span>
      <span>{current.label}</span>
      <span
        style={{
          color: "var(--muted)",
          fontSize: 11,
          borderLeft: "1px solid var(--border)",
          paddingLeft: 8,
        }}
      >
        {next.code.toUpperCase()}
      </span>
    </button>
  );
}
