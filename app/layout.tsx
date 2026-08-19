import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LangSwitcher } from "@/components/LangSwitcher";
import { detectLang } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Axion Client",
  description: "Axion Client — private Minecraft utility client",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = detectLang((await cookies()).get("lang")?.value);
  return (
    <html lang={lang}>
      <body>
        <LanguageProvider initialLang={lang}>
          {children}
          <LangSwitcher />
        </LanguageProvider>
      </body>
    </html>
  );
}
