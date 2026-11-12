import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { MarkDefs } from "@/components/Mark";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "greek"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.glassworks.dev"),
  title: { default: "Glassworks", template: "%s · Glassworks" },
  description:
    "Open-source core for Home Assistant wall panels: dashboard, ESPHome device, setup and updates, with plugins for everything else.",
  openGraph: { siteName: "Glassworks", type: "website" },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceef2" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <MarkDefs />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
