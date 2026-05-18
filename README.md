# Juice=Juiceコール学習サイト

Juice=Juice の発売楽曲を発売日順に並べた、縦型タイムラインの非公式ファンサイト。

## 技術スタック

- Next.js (App Router) + TypeScript
- Tailwind CSS
- 静的書き出し (`output: "export"`) — どこでもホスティング可能

## 開発

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # out/ に静的ファイル生成
```

## デプロイ

Cloudflare Pages へ `hello-project.jp` 用の静的サイトとしてデプロイします。

```bash
npx wrangler login
npm run deploy
```

初回デプロイ後、Cloudflare Pages の Custom domains で `hello-project.jp` を追加し、DNS を Cloudflare に向けてください。プレビュー用には `npm run deploy:preview` を使えます。

### Xログインと編集権限

コールタイムラインの編集は、X OAuth でログインした許可済みユーザーだけが行えます。閲覧は誰でも可能です。

Cloudflare 側で D1 database を作成し、`wrangler.toml` の `database_id` を差し替えてください。

```bash
wrangler d1 create hello-project-jp
npm run db:migrate
```

Cloudflare Pages の環境変数 / Secret に以下を設定します。

```bash
wrangler pages secret put X_CLIENT_ID --project-name hello-project-jp
wrangler pages secret put X_CLIENT_SECRET --project-name hello-project-jp
wrangler pages secret put SESSION_SECRET --project-name hello-project-jp
```

通常の環境変数:

```text
X_REDIRECT_URI=https://hello-project.jp/api/auth/x/callback
ADMIN_X_USER_IDS=1234567890
```

X Developer Portal 側の OAuth 2.0 callback URL も `https://hello-project.jp/api/auth/x/callback` にします。最初の管理者は `ADMIN_X_USER_IDS` に自分の X user id を入れてください。管理者は `/api/admin/allowed-users` API で編集メンバーを追加できます。

管理画面は `/admin/` です。管理者でログインすると、`@username` で編集メンバーを追加・削除できます。追加されたユーザーは、次回 X ログイン時にコールタイムラインを編集できるようになります。

## ジャケット画像の自動取得

`data/releases.json` の各リリースに `cover` URL を一括で埋めるスクリプトを同梱しています (iTunes Search API を利用)。

```bash
node scripts/fetch-covers.mjs
```

すでに `cover` が設定されているリリースはスキップされます。マッチしなかったリリースは手動で `cover` を埋めてください (`/public/covers/` に画像を置いて相対パスを指定する形が安心です)。

## 作詞・作曲クレジットの追加

`data/credits.json` に楽曲の作詞・作曲・編曲情報を入れると、楽曲個別ページに表示されます。キーは正規化された曲名 (バージョン括弧書きを除いたもの)。

```json
{
  "ロマンスの途中": {
    "lyricist": "つんく",
    "composer": "つんく",
    "arranger": "鈴木Daichi秀行"
  }
}
```

CSV からの一括インポートも可:

```bash
node scripts/import-credits.mjs path/to/credits.csv
```

CSV ヘッダは `title,lyricist,composer,arranger` の形式。空欄は未指定として扱われ、既存エントリにマージされます。

## 楽曲データの追加・修正

- `data/releases.json` … シングル / アルバム / 配信などのリリース情報
- `data/members.json` … 歴代メンバー情報

データ構造は `app/types.ts` を参照。`releaseDate` は `YYYY-MM-DD` 形式で記載すれば、UI 側で自動的に発売日順にソートされ、年ごとに見出しが表示されます。

## コール練習・コールメモ

楽曲個別ページに、オタクのコール練習用パネルとコールメモ欄があります。

- BPM を指定して、コールを一定テンポで表示できます。
- コールメモに書き込んだ内容は、その楽曲の練習シーケンスとして使われます。
- このサイトは静的書き出しのため、書き込みはブラウザの localStorage に保存されます。サーバー共有や全ユーザー共通投稿にする場合は、別途 API / DB / 認証の追加が必要です。

## 注意

- データは Wikipedia / ハロー！プロジェクト公式サイト等を参照して人手で作成しています。誤りがあれば PR をお願いします。
- ジャケット画像・楽曲の権利はすべてアップフロントワークス／ハロー！プロジェクトに帰属します。本サイトは権利者と無関係の非公式ファンサイトです。
