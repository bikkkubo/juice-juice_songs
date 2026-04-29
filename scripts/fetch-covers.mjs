// Populate the `cover` field in data/releases.json by querying iTunes Search API.
// Run with: node scripts/fetch-covers.mjs

import fs from "node:fs";
import path from "node:path";

const RELEASES_PATH = "data/releases.json";
const ARTIST = "Juice=Juice";
const HIRES = "600x600bb.jpg";

async function searchITunes(term, entity) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&country=JP&limit=200`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
      Accept: "application/json,*/*",
    },
  });
  if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);
  const data = await res.json();
  return data.results ?? [];
}

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[!?！？\s/／\-‐–—~〜()（）「」『』]/g, "")
    .replace(/＝/g, "=");

async function main() {
  const raw = fs.readFileSync(RELEASES_PATH, "utf8");
  const releases = JSON.parse(raw);

  console.log(`Loaded ${releases.length} releases from ${RELEASES_PATH}`);

  const albums = await searchITunes(ARTIST, "album");
  const songs = await searchITunes(ARTIST, "song");
  console.log(
    `Fetched ${albums.length} albums and ${songs.length} songs from iTunes`
  );

  const candidates = albums.filter((a) =>
    norm(a.artistName).includes("juice=juice")
  );
  console.log(`After artist filter: ${candidates.length} candidates`);

  const findCover = (release) => {
    const firstPart = release.title.split(/\s*\/\s*/)[0];
    const target = norm(firstPart);

    const matches = candidates
      .map((c) => {
        const cTitle = norm(c.collectionName);
        let score = 0;
        // タイトル類似度: 完全一致以外は最低限
        // (短いキーワードだけで偶然マッチするのを防ぐためサブストリングは
        //  ある程度の長さ要求)
        if (cTitle === target) score += 100;
        else if (target.length >= 4 && cTitle.includes(target)) score += 60;
        else if (cTitle.length >= 4 && target.includes(cTitle)) score += 40;
        const dt =
          Math.abs(
            new Date(c.releaseDate).getTime() -
              new Date(release.releaseDate).getTime()
          ) /
          (1000 * 60 * 60 * 24);
        if (dt < 7) score += 50;
        else if (dt < 30) score += 30;
        else if (dt < 365) score += 10;
        return { c, score, dt };
      })
      .filter((m) => m.score >= 50)
      .sort((a, b) => b.score - a.score);

    return matches[0] ?? null;
  };

  let matched = 0;
  let skipped = 0;

  for (const r of releases) {
    if (r.cover) {
      skipped++;
      continue;
    }
    const m = findCover(r);
    if (m) {
      const url = m.c.artworkUrl100?.replace(/100x100bb\.jpg$/, HIRES);
      if (url) {
        r.cover = url;
        matched++;
        console.log(
          `✓ ${r.releaseDate}  ${r.title.slice(0, 30).padEnd(30)} → ${m.c.collectionName} (score=${m.score})`
        );
      }
    } else {
      console.log(
        `✗ ${r.releaseDate}  ${r.title.slice(0, 30).padEnd(30)}   no match`
      );
    }
  }

  fs.writeFileSync(RELEASES_PATH, JSON.stringify(releases, null, 2) + "\n");
  console.log(
    `\nMatched ${matched} / ${releases.length}  (skipped ${skipped} already-set)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
