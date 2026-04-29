// CSV をインポートして data/credits.json にマージするスクリプト。
//
// CSV format:
//   title,lyricist,composer,arranger
//   ロマンスの途中,つんく,つんく,鈴木Daichi秀行
//
// - 1 行目はヘッダ (title,lyricist,composer,arranger)
// - 空欄の列は省略可 (空文字なら未指定として扱う)
// - title はリリース内のトラック名そのままでも、バージョン括弧書きを
//   除いた正規形でも OK。スクリプト側で正規化する。
//
// Usage:
//   node scripts/import-credits.mjs path/to/credits.csv

import fs from "node:fs";
import path from "node:path";

const CREDITS_PATH = "data/credits.json";

const canonicalize = (title) => {
  let s = String(title).trim();
  s = s.replace(/\s*[(（][^)）]*[)）]\s*$/u, "");
  s = s.replace(/\s+-[^-]+-$/u, "");
  s = s.replace(/\s+\d{4}$/u, "");
  return s.trim();
};

// 簡易 CSV パーサ (ダブルクォート対応)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') inQuote = true;
      else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (ch === "\r") {
        // skip
      } else {
        cell += ch;
      }
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-credits.mjs path/to/credits.csv");
  process.exit(1);
}

const csvText = fs.readFileSync(csvPath, "utf8");
const rows = parseCsv(csvText).filter((r) => r.length && r.some((c) => c));

const header = rows[0].map((h) => h.trim().toLowerCase());
const idx = {
  title: header.indexOf("title"),
  lyricist: header.indexOf("lyricist"),
  composer: header.indexOf("composer"),
  arranger: header.indexOf("arranger"),
};
if (idx.title < 0) {
  console.error('CSV header must include "title" column');
  process.exit(1);
}

let credits = {};
if (fs.existsSync(CREDITS_PATH)) {
  credits = JSON.parse(fs.readFileSync(CREDITS_PATH, "utf8"));
}

let added = 0;
let updated = 0;
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const title = canonicalize(r[idx.title] ?? "");
  if (!title) continue;
  const entry = {};
  if (idx.lyricist >= 0 && r[idx.lyricist]?.trim())
    entry.lyricist = r[idx.lyricist].trim();
  if (idx.composer >= 0 && r[idx.composer]?.trim())
    entry.composer = r[idx.composer].trim();
  if (idx.arranger >= 0 && r[idx.arranger]?.trim())
    entry.arranger = r[idx.arranger].trim();
  if (!entry.lyricist && !entry.composer && !entry.arranger) continue;

  const exists = !!credits[title];
  credits[title] = { ...(credits[title] ?? {}), ...entry };
  if (exists) updated++;
  else added++;
  console.log(
    `${exists ? "↻" : "+"} ${title}  ${[entry.lyricist && `作詞:${entry.lyricist}`, entry.composer && `作曲:${entry.composer}`, entry.arranger && `編曲:${entry.arranger}`].filter(Boolean).join(" / ")}`
  );
}

const sorted = Object.fromEntries(
  Object.entries(credits).sort(([a], [b]) => a.localeCompare(b, "ja"))
);
fs.writeFileSync(CREDITS_PATH, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nDone. +${added} new, ↻${updated} updated → ${CREDITS_PATH}`);
