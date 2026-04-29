# Juice=Juice 楽曲年表

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

## ジャケット画像の自動取得

`data/releases.json` の各リリースに `cover` URL を一括で埋めるスクリプトを同梱しています (iTunes Search API を利用)。

```bash
node scripts/fetch-covers.mjs
```

すでに `cover` が設定されているリリースはスキップされます。マッチしなかったリリースは手動で `cover` を埋めてください (`/public/covers/` に画像を置いて相対パスを指定する形が安心です)。

## 楽曲データの追加・修正

- `data/releases.json` … シングル / アルバム / 配信などのリリース情報
- `data/members.json` … 歴代メンバー情報

データ構造は `app/types.ts` を参照。`releaseDate` は `YYYY-MM-DD` 形式で記載すれば、UI 側で自動的に発売日順にソートされ、年ごとに見出しが表示されます。

## 注意

- データは Wikipedia / ハロー！プロジェクト公式サイト等を参照して人手で作成しています。誤りがあれば PR をお願いします。
- ジャケット画像・楽曲の権利はすべてアップフロントワークス／ハロー！プロジェクトに帰属します。本サイトは権利者と無関係の非公式ファンサイトです。
