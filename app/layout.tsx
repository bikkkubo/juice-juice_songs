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
    process.env.GITHUB_PAGES === "true"
      ? "https://bikkkubo.github.io/juice-juice_songs"
      : "http://localhost:3000"
  ),
  title: "Juice=Juice 楽曲年表",
  description:
    "Juice=Juice がリリースしてきた楽曲・シングル・アルバムを年表形式でまとめた非公式ファンサイト",
  openGraph: {
    title: "Juice=Juice 楽曲年表",
    description:
      "2013年のインディーズデビューから現在までのシングル・アルバム・配信を年表で。",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Juice=Juice 楽曲年表",
    description:
      "2013年のインディーズデビューから現在までのシングル・アルバム・配信を年表で。",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${noto.variable} ${inter.variable}`}>
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
