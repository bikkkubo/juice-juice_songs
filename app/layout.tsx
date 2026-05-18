import type { Metadata } from "next";
import { Noto_Sans_JP, Inter } from "next/font/google";
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
  title: "Juice=Juiceコール練習サイト",
  description:
    "Juice=Juice のライブ前にコールのタイミングを確認・練習できる非公式ファンサイト",
  openGraph: {
    title: "Juice=Juiceコール練習サイト",
    description:
      "ライブ映像や音源に合わせてJuice=Juiceのコールを練習できます。",
    locale: "ja_JP",
    type: "website",
    url: "/",
    siteName: "Juice=Juiceコール練習サイト",
    images: [
      {
        url: "/api/og-image",
        width: 1200,
        height: 630,
        alt: "Juice=Juiceコール練習サイト",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Juice=Juiceコール練習サイト",
    description:
      "ライブ映像や音源に合わせてJuice=Juiceのコールを練習できます。",
    images: ["/api/og-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${noto.variable} ${inter.variable}`}>
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
