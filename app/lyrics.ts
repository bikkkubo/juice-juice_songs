const ARTIST = "Juice=Juice";

const cleanTitle = (t: string) =>
  t
    .replace(/\s*[(（][^)）]*[)）]\s*$/u, "")
    .trim();

export function lyricsSearchUrl(track: string): string {
  const q = `${cleanTitle(track)} ${ARTIST}`;
  return `https://www.uta-net.com/search/?Aselect=1&Keyword=${encodeURIComponent(q)}`;
}

export const ARTIST_LYRICS_URL =
  "https://www.uta-net.com/search/?Aselect=3&Keyword=Juice%3DJuice";
