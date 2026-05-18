import Link from "next/link";
import membersData from "@/data/members.json";
import { getAllSongs } from "@/app/songs";
import type { Member } from "@/app/types";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

const screenshotBase = "/manual/call-editor";

const steps = [
  {
    title: "1. Xでログインする",
    image: "call-editor-overview.png",
    body: [
      "画面右上の「Xログイン」からログインします。編集権限があるアカウントでは、ヘッダーや編集画面に「@username / 編集可」と表示されます。",
      "「閲覧のみ」と表示される場合は、管理者にXのユーザー名を伝えて編集メンバーに追加してもらってください。",
    ],
  },
  {
    title: "2. 編集メンバーを追加する",
    image: "admin-allowed-users.png",
    body: [
      "管理者は /admin/ から編集メンバーを追加できます。原則として、先に本人にXログインしてもらい、「APPROVE LOGGED-IN USERS」から editor または admin を選んで承認します。",
      "まだ本人がログインしていない場合だけ、「ADD USER BY USERNAME」で @username を事前登録できます。この場合は「未ログイン仮登録」と表示され、本人の次回Xログイン時にX IDが自動で紐づきます。",
    ],
  },
  {
    title: "3. 「ここ！」で打点を追加する",
    image: "call-editor-add-time.png",
    body: [
      "曲別・汎用・メンバー名から入れたいコールを選び、動画を再生しながらタイミングで「ここ！」を押します。",
      "任意のコールを入れたい場合は入力欄に文言を書き、「任意で打点」を押します。補正を 0.1 などにすると、現在位置から少し後ろへずらして登録できます。",
    ],
  },
  {
    title: "4. 追加後に確認する",
    image: "call-editor-after-add.png",
    body: [
      "追加したコールは下のバーとTIMELINEに反映されます。動画を少し前から再生して、画面中央のオーバーレイ表示が狙ったタイミングで出るか確認します。",
      "保存状態が「保存済み」になればサーバー保存完了です。リロード後も同じ内容が残っていれば問題ありません。",
    ],
  },
  {
    title: "5. TIMELINEで微調整・削除する",
    image: "call-editor-timeline.png",
    body: [
      "TIMELINEの「移動」で該当秒へ移動できます。秒数欄は 83.2 または 1:23.2 の形式で直接編集できます。",
      "早い場合は +0.1、遅い場合は -0.1 で調整します。不要な行は「削除」で消します。",
    ],
  },
];

export default function CallEditorManualPage() {
  const members = membersData as Member[];

  return (
    <>
      <Header songCount={getAllSongs().length} memberCount={members.length} />
      <main className="mx-auto max-w-page px-5 pb-24 pt-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-ink-weak transition hover:text-accent"
        >
          ← トップに戻る
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-[10px] font-mono tracking-[0.25em] text-ink-weak">
            EDITOR MANUAL
          </p>
          <h1 className="text-2xl font-bold leading-tight text-ink">
            コール編集マニュアル
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-weak">
            許可された編集メンバーが、楽曲ごとのコールタイミングを追加・調整するための手順です。
            画面上のコールは常時表示ではなく、指定した秒数から短時間だけ表示されます。
          </p>
        </header>

        <section className="mb-10 rounded-2xl border border-accent/30 bg-white p-4">
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-ink-weak">
            基本ルール
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed text-ink-weak">
            <li>編集できるのは、管理者が許可したXアカウントだけです。</li>
            <li>編集者の追加は、本人が一度XログインしたあとにAdmin画面から承認するのが基本です。</li>
            <li>まずは「ここ！」で大まかに打ち、TIMELINEで 0.1秒単位に整えます。</li>
            <li>迷ったら早めに出すより、実際に声を出す瞬間に近づけます。</li>
            <li>曲全体がズレている場合は、個別調整の前に全体補正を使います。</li>
          </ul>
        </section>

        <div className="space-y-10">
          {steps.map((step) => (
            <section key={step.title} className="space-y-3">
              <h2 className="text-lg font-bold text-ink">{step.title}</h2>
              <div className="space-y-2 text-sm leading-relaxed text-ink-weak">
                {step.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <img
                src={`${screenshotBase}/${step.image}`}
                alt={step.title}
                className="w-full rounded-xl border border-border bg-white shadow-sm"
              />
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-white p-4">
          <h2 className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-ink-weak">
            困ったとき
          </h2>
          <dl className="space-y-3 text-sm leading-relaxed">
            <div>
              <dt className="font-bold text-ink">編集できない</dt>
              <dd className="text-ink-weak">
                Xログインしていない、または許可リストに入っていない可能性があります。
                先にXログインしたうえで、管理者に承認を依頼してください。
              </dd>
            </div>
            <div>
              <dt className="font-bold text-ink">保存されない</dt>
              <dd className="text-ink-weak">
                ログイン状態が切れている可能性があります。再度Xログインしてから編集してください。
              </dd>
            </div>
            <div>
              <dt className="font-bold text-ink">動画が表示されない</dt>
              <dd className="text-ink-weak">
                ブラウザ拡張やネットワーク制限でYouTube埋め込みがブロックされる場合があります。
                楽曲ページの「YouTubeで開く」または「YouTube Musicで開く」から直接確認してください。
              </dd>
            </div>
          </dl>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
