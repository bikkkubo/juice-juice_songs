import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-20 space-y-2 border-t border-border pt-6 text-center text-[11px] text-ink-weak">
      <p>
        このサイトは非公式のファンサイトです。ハロー！プロジェクト、Juice=Juice、
        アップフロントグループ各社とは関係ありません。
      </p>
      <p>
        収益化を目的としたサイトではありません。広告掲載・有料販売・投げ銭受付などは行いません。
      </p>
      <p>
        楽曲・歌詞・映像・画像などの権利は各権利者に帰属します。著作権その他の権利を侵害しない範囲で、
        ライブ前のコール練習を目的として運営しています。
      </p>
      <p>
        作成・質問・要望などは{" "}
        <a
          className="text-accent underline-offset-2 hover:underline"
          href="https://x.com/hellopro_mii"
          target="_blank"
          rel="noreferrer"
        >
          @hellopro_mii
        </a>{" "}
        にお願いします。
      </p>
      <p>
        歌詞はJASRAC許諾済の{" "}
        <a
          className="text-accent underline-offset-2 hover:underline"
          href="https://www.uta-net.com/search/?Aselect=3&Keyword=Juice%3DJuice"
          target="_blank"
          rel="noreferrer"
        >
          歌ネット ↗
        </a>{" "}
        の検索結果へリンクしています。
      </p>
      <p>
        <a
          className="text-accent underline-offset-2 hover:underline"
          href="https://helloproject.com/juicejuice/"
          target="_blank"
          rel="noreferrer"
        >
          公式サイト ↗
        </a>
        <span className="px-2">/</span>
        <Link href="/" className="text-accent underline-offset-2 hover:underline">
          トップに戻る
        </Link>
      </p>
    </footer>
  );
}
