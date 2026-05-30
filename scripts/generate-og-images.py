from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "og" / "background.png"
OUTPUT = ROOT / "public" / "og"
SIZE = (1200, 630)


def find_font() -> str:
    for pattern in (
        "ヒラギノ角ゴシック W7.ttc",
        "ヒラギノ角ゴシック W6.ttc",
        "YuGothic-Bold.otf",
    ):
        matches = list(Path("/System/Library").rglob(pattern))
        if matches:
            return str(matches[0])
    return "/System/Library/Fonts/AppleSDGothicNeo.ttc"


FONT = find_font()

GROUP_BACKGROUNDS = {
    "juice-juice": ROOT / "public" / "og" / "background-juice-juice.png",
    "angerme": ROOT / "public" / "og" / "background-angerme.png",
    "morning-musume": ROOT / "public" / "og" / "background-morning-musume.png",
    "ocha-norma": ROOT / "public" / "og" / "background-ocha-norma.png",
    "tsubaki-factory": ROOT / "public" / "og" / "background-tsubaki-factory.png",
    "rosy-chronicle": ROOT / "public" / "og" / "background-rosy-chronicle.png",
}

SONG_SLUG_OVERRIDES = {
    "盛れ!ミ・アモーレ": "more-mi-amore",
    "四の五の言わず颯と別れてあげた": "shinogono-iwazu-satto-wakarete-ageta",
    "GIRLS BE AMBITIOUS! 2026": "girls-be-ambitious-2026",
    "プラトニック・プラネット": "platonic-planet",
    "BLOODY BULLET": "bloody-bullet",
    "私が言う前に抱きしめなきゃね": "watashi-ga-iu-mae-ni-dakishimenakya-ne",
    "甘えんな": "amaenna",
    "ひとりで生きられそうって それってねえ、褒めているの?": "hitoride-ikirare-sou-tte-sorette-nee-hometeiru-no",
    "Fiesta! Fiesta!": "fiesta-fiesta",
    "プライド・ブライト": "pride-bright",
    "イジワルしないで 抱きしめてよ": "ijiwaru-shinaide-dakishimete-yo",
    "素直に甘えて": "sunao-ni-amaete",
    "微炭酸": "bitansan",
    "ノクチルカ": "noctiluca",
    "雨の中の口笛": "ame-no-naka-no-kuchibue",
    "愛・愛・傘": "ai-ai-gasa",
    "TOKYOグライダー": "tokyo-glider",
    "伊達じゃないよ うちの人生は": "date-janai-yo-uchi-no-jinsei-wa",
    "Va-Va-Voom": "va-va-voom",
    "この世界は捨てたもんじゃない": "kono-sekai-wa-suteta-mon-janai",
    "Goal〜明日はあっちだよ〜": "goal-ashita-wa-acchi-dayo",
    "トウキョウ・ブラー": "tokyo-blur",
    "今夜はHearty Party": "konya-wa-hearty-party",
    "POPPIN’ LOVE": "poppin-love",
    "禁断少女": "kindan-shoujo",
    "イニミニマニモ〜恋のライバル宣言〜": "eeny-meeny-miny-moe-koi-no-rival-sengen",
    "ライバル": "rival",
    "地団駄ダンス": "jidanda-dance",
    "ポップミュージック": "pop-music",
    "あばれてっか?! ハヴアグッタイ": "abarete-kka-have-a-good-time",
    "This is 運命": "this-is-unmei",
    "全部賭けてGO!!": "zenbu-kakete-go",
    "情熱エクスタシー": "jounetsu-ecstasy",
    "Future Smile": "future-smile",
    "Never Never Surrender": "never-never-surrender",
    "STAGE〜アガッてみな〜": "stage-agatte-mina",
    "ナイモノラブ": "naimono-love",
    "GIRLS BE AMBITIOUS!": "girls-be-ambitious",
    "がんばれないよ": "ganbarenai-yo",
    "初恋の亡霊": "hatsukoi-no-bourei",
    "風に吹かれて": "kaze-ni-fukarete",
    "DOWN TOWN": "down-town",
    "Vivid Midnight": "vivid-midnight",
    "Mon Amour": "mon-amour",
    "大人の事情": "otona-no-jijou",
    "Next is you!": "next-is-you",
    "選ばれし私達": "erabareshi-watashitachi",
    "明日やろうはバカやろう": "ashita-yarou-wa-baka-yarou",
    "五月雨美女がさ乱れる": "samidare-bijo-ga-samidare",
    "CHOICE & CHANCE": "choice-and-chance",
    "Magic of Love": "magic-of-love",
    "未来へ、さあ走り出せ!": "mirai-e-saa-hashiridase",
    "生まれたてのBaby Love": "umaretate-no-baby-love",
    "如雨露": "joro",
    "G.O.A.T.": "goat",
    "KEEP ON 上昇志向!!": "keep-on-joushou-shikou",
}


def normalize_punct(value: str) -> str:
    value = (
        value.replace("&amp;", "&")
        .replace("&quot;", '"')
        .replace("&#39;", "'")
        .replace("！", "!")
        .replace("？", "?")
        .replace("～", "〜")
    )
    value = re.sub(r"[「」『』]", "", value)
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if not (0x0300 <= ord(ch) <= 0x036F))
    value = re.sub(r"\s*〜\s*", "〜", value)
    value = re.sub(r"([!?])\s+(?=[^\x00-\x7f])", r"\1", value)
    value = re.sub(r"\s+", " ", value)
    return unicodedata.normalize("NFC", value)


def canonicalize(title: str, aliases: dict[str, str]) -> str:
    value = normalize_punct(title.strip())
    if value == "GIRLS BE AMBITIOUS! 2026":
        return value
    is_remix = re.search("remix", value, re.I) is not None
    if not is_remix:
        value = re.sub(r"[(（][^)）]*[)）]", "", value)
        value = re.sub(r"\s+-[^-]+-$", "", value)
    value = re.sub(r"\s+\d{4}$", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    return aliases.get(value, value)


def hash_title(title: str) -> str:
    hash_value = 2166136261
    for ch in title:
        hash_value ^= ord(ch)
        hash_value = (hash_value * 16777619) & 0xFFFFFFFF
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    if hash_value == 0:
        return "0"
    out = ""
    while hash_value:
        hash_value, rem = divmod(hash_value, 36)
        out = digits[rem] + out
    return out


def song_slug(title: str) -> str:
    if title in SONG_SLUG_OVERRIDES:
        return SONG_SLUG_OVERRIDES[title]
    ascii_slug = re.sub(r"[^a-z0-9]+", "-", title.lower().replace("&", " and "))
    ascii_slug = ascii_slug.strip("-")
    return ascii_slug or f"song-{hash_title(title)}"


def cover_crop(image: Image.Image) -> Image.Image:
    image = image.convert("RGB")
    scale = max(SIZE[0] / image.width, SIZE[1] / image.height)
    resized = image.resize((round(image.width * scale), round(image.height * scale)), Image.LANCZOS)
    left = (resized.width - SIZE[0]) // 2
    top = (resized.height - SIZE[1]) // 2
    return resized.crop((left, top, left + SIZE[0], top + SIZE[1]))


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for ch in text:
        candidate = current + ch
        if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = ch
    if current:
        lines.append(current)
    return lines[:2]


def draw_image(
    group_name: str,
    primary: str,
    output: Path,
    subtitle: str | None = "コール練習",
    source: Path = SOURCE,
) -> None:
    image = cover_crop(Image.open(source))
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    for y in range(SIZE[1]):
        alpha = int(80 + 105 * (y / SIZE[1]))
        odraw.line([(0, y), (SIZE[0], y)], fill=(7, 4, 23, alpha))
    image = Image.alpha_composite(image.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(image)

    group_font = ImageFont.truetype(FONT, 56)
    title_font = ImageFont.truetype(FONT, 76)
    subtitle_font = ImageFont.truetype(FONT, 60)

    draw.text((74, 72), group_name, font=group_font, fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
    lines = wrap_text(draw, primary, title_font, 1020)
    y = 368 if len(lines) == 1 else 330
    for line in lines:
        draw.text((74, y), line, font=title_font, fill=(255, 255, 255), stroke_width=4, stroke_fill=(0, 0, 0))
        y += 82
    if subtitle:
        draw.text((74, y + 8), subtitle, font=subtitle_font, fill=(255, 255, 255), stroke_width=4, stroke_fill=(0, 0, 0))

    output.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(output, "JPEG", quality=86, optimize=True, progressive=True)


def main() -> None:
    groups = json.loads((ROOT / "data" / "groups" / "index.json").read_text())
    draw_image("Hello! Project", "コール練習サイト", OUTPUT / "hello-project.jpg", subtitle=None)
    for group in groups:
        slug = group["slug"]
        group_name = group["name"]
        source = GROUP_BACKGROUNDS.get(slug, SOURCE)
        draw_image(group_name, "コール練習サイト", OUTPUT / f"{slug}.jpg", subtitle=None, source=source)

        releases_path = ROOT / "data" / "groups" / slug / "releases.json"
        aliases_path = ROOT / "data" / "groups" / slug / "aliases.json"
        aliases = json.loads(aliases_path.read_text()) if aliases_path.exists() else {}
        releases = json.loads(releases_path.read_text()) if releases_path.exists() else []
        songs: dict[str, str] = {}
        for release in sorted(releases, key=lambda item: item.get("releaseDate", "")):
            for track in release.get("tracks", []):
                canonical = canonicalize(track, aliases)
                if canonical:
                    songs.setdefault(canonical, song_slug(canonical))
        for canonical, slug_value in songs.items():
            draw_image(group_name, canonical, OUTPUT / slug / f"{slug_value}.jpg", source=source)


if __name__ == "__main__":
    main()
