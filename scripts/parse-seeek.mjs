// Parse the SEEEK.world song-list HTML and emit title,lyricist,composer rows.
// Usage:
//   node scripts/parse-seeek.mjs > /tmp/seeek.csv
//   node scripts/import-credits.mjs /tmp/seeek.csv

import fs from "node:fs";

const FILE = "Juice=Juiceの楽曲一覧 _ SEEEK.html";
const html = fs.readFileSync(FILE, "utf8");

// Match each SongCard block: songTitle followed by credits.
// HTML pattern (saved page):
//   <p class="SongCard-module__pO871a__songTitle">TITLE</p>
//   <p class="SongCard-module__pO871a__credits">作詞：A　作曲：B</p>
const re =
  /<p class="SongCard-module__[^"]*__songTitle">([^<]+)<\/p>\s*<p class="SongCard-module__[^"]*__credits">(作詞：[^<]+)<\/p>/g;

const items = [];
let m;
while ((m = re.exec(html)) !== null) {
  items.push({ title: m[1].trim(), credits: m[2].trim() });
}

// JSON-encoded part (頂上の数件、保存時に未レンダリングだった分)
const jsonRe =
  /__songTitle\\","children\\":\\"([^\\"]+)\\"[\s\S]{0,500}?__credits\\","children\\":\\"(作詞：[^\\"]+)\\"/g;
while ((m = jsonRe.exec(html)) !== null) {
  items.push({ title: m[1].trim(), credits: m[2].trim() });
}

// Dedup
const seen = new Set();
const unique = items.filter((i) => {
  if (seen.has(i.title)) return false;
  seen.add(i.title);
  return true;
});

const csvEscape = (s) => {
  if (s.includes(",") || s.includes('"') || s.includes("\n"))
    return '"' + s.replace(/"/g, '""') + '"';
  return s;
};

const parseCredits = (s) => {
  const m1 = s.match(/作詞：([^　]+)/);
  const m2 = s.match(/作曲：([^　]+)/);
  return {
    lyricist: m1 ? m1[1].trim() : "",
    composer: m2 ? m2[1].trim() : "",
  };
};

console.log("title,lyricist,composer,arranger");
for (const it of unique) {
  const { lyricist, composer } = parseCredits(it.credits);
  console.log(
    [csvEscape(it.title), csvEscape(lyricist), csvEscape(composer), ""].join(",")
  );
}

console.error(`Extracted ${unique.length} unique songs`);
