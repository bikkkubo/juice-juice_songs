import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
import { ROOT_SITE_NAME, rootOpenGraph } from "./metadata";
import "./globals.css";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.GITHUB_PAGES === "true"
        ? "https://bikkkubo.github.io/juice-juice_songs"
        : "https://hello-project.jp")
  ),
  title: ROOT_SITE_NAME,
  description:
    "ハロー！プロジェクト各グループのライブ前にコールのタイミングを確認・練習できる非公式ファンサイト",
  openGraph: rootOpenGraph,
  twitter: {
    card: "summary_large_image",
    title: ROOT_SITE_NAME,
    description:
      "ライブ映像や音源に合わせてハロー！プロジェクト楽曲のコールを練習できます。",
    images: ["/og/hello-project.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${noto.variable} ${inter.variable}`}>
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
