import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juice=Juice 楽曲年表",
  description:
    "Juice=Juice がリリースしてきた楽曲・シングル・アルバムを年表形式でまとめた非公式ファンサイト",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
