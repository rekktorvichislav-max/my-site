"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { DEFAULT_LANG, getDict, translate, type Lang, type Dict } from "@/lib/i18n";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  dict: Dict;
}

const LangContext = createContext<LangContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
  dict: getDict(DEFAULT_LANG),
});

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dict = getDict(lang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.cookie = `lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    try {
      fetch("/api/lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: l }),
      }).catch(() => {});
    } catch {
      // Language still applies locally via the cookie.
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => translate(dict, key, vars),
    [dict]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t, dict }}>{children}</LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
