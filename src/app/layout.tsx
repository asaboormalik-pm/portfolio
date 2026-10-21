import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import type { ThemeColorKey } from "@/db/schema";
import { getTenant } from "@/lib/content";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();
  return {
    title: { default: `${tenant.name} — ${tenant.roleLine}`, template: `%s — ${tenant.name}` },
    description: tenant.subhead,
  };
}

const colorVars: Record<ThemeColorKey, string> = {
  canvas: "--canvas",
  ink: "--ink",
  inkSoft: "--ink-soft",
  pine: "--pine",
  marigold: "--marigold",
  rose: "--rose",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  // Branding is tenant config, not code (PRD §6.2). Set on <html> so :root-derived tints follow.
  const theme = Object.fromEntries(
    Object.entries(tenant.themeConfig.colors ?? {})
      .filter(([k, v]) => v && k in colorVars)
      .map(([k, v]) => [colorVars[k as ThemeColorKey], v]),
  ) as CSSProperties;

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} style={theme}>
      <body>{children}</body>
    </html>
  );
}
