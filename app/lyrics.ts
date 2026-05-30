const cleanTitle = (t: string) =>
  t
    .replace(/\s*[(（][^)）]*[)）]\s*$/u, "")
    .trim();

export function lyricsSearchUrl(track: string, artist = "Juice=Juice"): string {
  const q = `${cleanTitle(track)} ${artist}`;
  return `https://www.uta-net.com/search/?Aselect=1&Keyword=${encodeURIComponent(q)}`;
}

export const artistLyricsUrl = (artist = "Juice=Juice"): string =>
  `https://www.uta-net.com/search/?Aselect=3&Keyword=${encodeURIComponent(artist)}`;
