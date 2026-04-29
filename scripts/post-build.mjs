import fs from "node:fs";
import path from "node:path";

const OUT = "out";

if (!fs.existsSync(OUT)) {
  console.log("[post-build] no out/ directory, skipping");
  process.exit(0);
}

// Next.js writes the OG image without an extension (file: out/opengraph-image).
// GitHub Pages serves unknown extensions as application/octet-stream, which
// breaks Twitter / Facebook / Slack crawlers. Rename + rewrite HTML references.
const src = path.join(OUT, "opengraph-image");
const dst = path.join(OUT, "opengraph-image.png");

if (fs.existsSync(src)) {
  fs.renameSync(src, dst);
  console.log(`[post-build] renamed ${src} -> ${dst}`);

  let updated = 0;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) {
        const before = fs.readFileSync(full, "utf8");
        const after = before.replace(
          /opengraph-image(\?|")/g,
          "opengraph-image.png$1"
        );
        if (before !== after) {
          fs.writeFileSync(full, after);
          updated++;
        }
      }
    }
  };
  walk(OUT);
  console.log(`[post-build] rewrote ${updated} html file(s)`);
} else {
  console.log(`[post-build] ${src} not found, skipping rename`);
}
