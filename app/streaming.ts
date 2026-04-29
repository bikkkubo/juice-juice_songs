const ARTIST = "Juice=Juice";

const cleanQuery = (title: string) =>
  title
    .split(/\s*\/\s*/)[0]
    .replace(/\s*[(（][^)）]*[)）]\s*$/u, "")
    .trim();

const q = (title: string) =>
  encodeURIComponent(`${ARTIST} ${cleanQuery(title)}`);

export function youtubeUrl(title: string): string {
  return `https://www.youtube.com/results?search_query=${q(title)}`;
}

export function appleMusicUrl(title: string): string {
  return `https://music.apple.com/jp/search?term=${q(title)}`;
}

export function spotifyUrl(title: string): string {
  return `https://open.spotify.com/search/${q(title)}`;
}
