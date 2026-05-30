const cleanQuery = (title: string) =>
  title
    .split(/\s*\/\s*/)[0]
    .replace(/\s*[(（][^)）]*[)）]\s*$/u, "")
    .trim();

const q = (title: string, artist: string) =>
  encodeURIComponent(`${artist} ${cleanQuery(title)}`);

export function youtubeUrl(title: string, artist = "Juice=Juice"): string {
  return `https://www.youtube.com/results?search_query=${q(title, artist)}`;
}

export function appleMusicUrl(title: string, artist = "Juice=Juice"): string {
  return `https://music.apple.com/jp/search?term=${q(title, artist)}`;
}

export function spotifyUrl(title: string, artist = "Juice=Juice"): string {
  return `https://open.spotify.com/search/${q(title, artist)}`;
}
