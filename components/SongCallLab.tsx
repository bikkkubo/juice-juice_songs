"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  GENERAL_TEMPLATES,
  MEMBER_TEMPLATES,
  type CallTemplate,
} from "@/app/callTemplates";

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: () => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState?: {
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type CallEntry = {
  id: string;
  phrase: string;
  timing: string;
  note: string;
  createdAt: string;
};

export type YouTubePlayer = {
  getCurrentTime: () => number;
  getPlayerState: () => number;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

export type TimedCall = {
  id: string;
  time: number;
  phrase: string;
  note: string;
};

type CallHistoryNote = {
  id: string;
  eventDate: string;
  body: string;
  sourceLabel: string;
  sourceUrl: string;
  updatedAt?: string;
};

type LiveVideoConfig = {
  videoId: string;
  startSeconds?: number;
  endSeconds?: number;
  defaultCalls?: TimedCall[];
  sourceLabel?: string;
  sourceDescription?: string;
  watchUrl?: string;
};

export type AuthState = {
  user: {
    id: string;
    username: string;
    name: string;
  } | null;
  role: string | null;
  canEdit: boolean;
};

type TemplateGroup = {
  label: string;
  templates: CallTemplate[];
};

const isMoreAmore = (songTitle: string) =>
  songTitle.replace(/\s+/g, "") === "盛れ!ミ・アモーレ";

const normalizeSongKey = (songTitle: string) =>
  songTitle
    .replace(/\s+/g, "")
    .replace(/[「」『』]/g, "")
    .replace(/[（(][ぁ-んァ-ヶー]+[）)]/g, "")
    .replace(/！/g, "!")
    .replace(/？/g, "?");

export const songTemplateGroups = (songTitle: string): TemplateGroup[] => {
  if (isMoreAmore(songTitle)) {
    return [
      {
        label: "盛れミ",
        templates: [
          {
            phrase: "盛れ！",
            timing: "タイトルフレーズ後",
            note: "盛れミの代表的な返し。",
          },
          {
            phrase: "アモーレ ミ・アモーレ！",
            timing: "ユニゾン",
            note: "会場で一緒に歌うパート。",
          },
          {
            phrase: "オイ！×4",
            timing: "裏拍",
            note: "サビ中の裏拍コール。",
          },
          {
            phrase: "盛れ！盛れ！盛れ盛れ盛れ！",
            timing: "盛れ！！！後",
            note: "強く畳みかける返し。",
          },
          {
            phrase: "M・O・R・E！",
            timing: "終盤",
            note: "終盤の全力コール。",
          },
        ],
      },
    ];
  }

  if (songTitle === "ナイモノラブ") {
    return [
      {
        label: "ナイモノラブ",
        templates: [
          {
            phrase: "あーたん！",
            timing: "1番Bメロ",
            note: "8連コールの基本単位。",
          },
          {
            phrase: "あーたん！×8",
            timing: "1番Bメロ",
            note: "ナイモノラブの名物コール。",
          },
        ],
      },
    ];
  }

  if (songTitle === "プライド・ブライト") {
    return [
      {
        label: "プライド・ブライト",
        templates: [
          {
            phrase: "プライド！",
            timing: "タイトルフレーズ",
            note: "タイトルに合わせて短く入れる返し。",
          },
          {
            phrase: "ブライト！",
            timing: "タイトルフレーズ",
            note: "タイトルに合わせて短く入れる返し。",
          },
          {
            phrase: "プライド・ブライト！",
            timing: "サビ / 決めフレーズ",
            note: "曲名フレーズに合わせるコール。",
          },
          {
            phrase: "オイ！×4",
            timing: "間奏 / 裏拍",
            note: "音源に合わせて配置しやすい汎用コール。",
          },
          {
            phrase: "フゥ！",
            timing: "決め / ブレイク",
            note: "跳ねるポイントに入れる短いコール。",
          },
        ],
      },
    ];
  }

  if (songTitle === "Magic of Love") {
    return [
      {
        label: "Magic of Love",
        templates: [
          {
            phrase: "だーいすーきー",
            timing: "ラスト",
            note: "ラストで一緒に叫ぶ定番参加ポイント。",
          },
          {
            phrase: "大好き！",
            timing: "大好き系フレーズ",
            note: "曲中の大好き系フレーズに合わせる。",
          },
        ],
      },
    ];
  }

  return [];
};

const buildDefaultSequence = (songTitle: string): string[] => {
  const songSpecific = songTemplateGroups(songTitle).flatMap((group) =>
    group.templates.map((template) => template.phrase)
  );

  if (songSpecific.length > 0) return songSpecific;

  return GENERAL_TEMPLATES.map((template) => template.phrase);
};

const createEntry = (template: CallTemplate): CallEntry => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  phrase: template.phrase,
  timing: template.timing,
  note: template.note,
  createdAt: new Date().toISOString(),
});

const storageKey = (groupSlug: string, songTitle: string) =>
  `calls:${groupSlug}:${songTitle}`;
const timedStorageKey = (groupSlug: string, songTitle: string, videoId: string) =>
  `timed-calls:${groupSlug}:${songTitle}:${videoId}`;

const MORE_AMORE_VIDEO_ID = "G36amiUCkXU";

const MORE_AMORE_TIMED_CALLS: TimedCall[] = [
  { id: "m01", time: 3.7, phrase: "盛れ！", note: "高速編集" },
  { id: "m02", time: 7.5, phrase: "盛れ！", note: "高速編集" },
  { id: "m03", time: 9.6, phrase: "盛れ！", note: "高速編集" },
  { id: "m04", time: 11.5, phrase: "盛れ！", note: "高速編集" },
  { id: "m05", time: 22.6, phrase: "オイ！×4", note: "高速編集" },
  { id: "m06", time: 24.4, phrase: "オイ！×4", note: "高速編集" },
  { id: "m07", time: 37.5, phrase: "ゆめちゃん", note: "高速編集" },
  { id: "m08", time: 41.0, phrase: "みふちゃん", note: "高速編集" },
  { id: "m09", time: 43.1, phrase: "るるちゃん", note: "高速編集" },
  { id: "m10", time: 44.7, phrase: "るるちゃん", note: "高速編集" },
  { id: "m11", time: 47.9, phrase: "きさき", note: "高速編集" },
  { id: "m12", time: 66.3, phrase: "アモーレ ミ・アモーレ！", note: "高速編集" },
  { id: "m13", time: 73.2, phrase: "オイ！×4", note: "高速編集" },
  { id: "m14", time: 75.0, phrase: "オイ！×4", note: "高速編集" },
  { id: "m15", time: 80.2, phrase: "アモーレ ミ・アモーレ！", note: "高速編集" },
  { id: "m16", time: 87.1, phrase: "オイ！×4", note: "高速編集" },
  { id: "m17", time: 88.8, phrase: "オイ！×4", note: "高速編集" },
  { id: "m18", time: 96.0, phrase: "盛れ！", note: "高速編集" },
  { id: "m19", time: 100.2, phrase: "りあい", note: "高速編集" },
  { id: "m20", time: 103.6, phrase: "きさき", note: "高速編集" },
  { id: "m21", time: 105.0, phrase: "れいれい", note: "高速編集" },
  { id: "m22", time: 107.0, phrase: "れいれい", note: "高速編集" },
  { id: "m23", time: 110.2, phrase: "るるちゃん", note: "高速編集" },
  { id: "m24", time: 128.9, phrase: "アモーレ ミ・アモーレ！", note: "高速編集" },
  { id: "m25", time: 135.9, phrase: "オイ！×4", note: "高速編集" },
  { id: "m26", time: 137.7, phrase: "オイ！×4", note: "高速編集" },
  { id: "m27", time: 142.7, phrase: "アモーレ ミ・アモーレ！", note: "高速編集" },
  { id: "m28", time: 149.8, phrase: "オイ！×4", note: "高速編集" },
  { id: "m29", time: 151.6, phrase: "オイ！×4", note: "高速編集" },
  { id: "m30", time: 158.4, phrase: "盛れ！", note: "高速編集" },
  { id: "m31", time: 161.0, phrase: "オイ！", note: "高速編集" },
  { id: "m32", time: 161.8, phrase: "オイ！", note: "高速編集" },
  { id: "m33", time: 162.5, phrase: "オイ！", note: "高速編集" },
  { id: "m34", time: 163.3, phrase: "オイ！", note: "高速編集" },
  { id: "m35", time: 164.5, phrase: "オイ！", note: "高速編集" },
  { id: "m36", time: 165.2, phrase: "オイ！", note: "高速編集" },
  { id: "m37", time: 166.1, phrase: "オイ！", note: "高速編集" },
  { id: "m38", time: 167.1, phrase: "盛れ！", note: "高速編集" },
  { id: "m39", time: 168.8, phrase: "盛れ！", note: "高速編集" },
  { id: "m40", time: 170.6, phrase: "盛れ！", note: "高速編集" },
  { id: "m41", time: 172.3, phrase: "盛れ！", note: "高速編集" },
  { id: "m42", time: 192.1, phrase: "アモーレ ミ・アモーレ！", note: "高速編集" },
  { id: "m43", time: 198.5, phrase: "オイ！×4", note: "高速編集" },
  { id: "m44", time: 200.7, phrase: "オイ！×4", note: "高速編集" },
  { id: "m45", time: 207.1, phrase: "盛れ！", note: "高速編集" },
  { id: "m46", time: 208.1, phrase: "盛れ！", note: "高速編集" },
  { id: "m47", time: 208.8, phrase: "盛れ！", note: "高速編集" },
  { id: "m48", time: 209.3, phrase: "盛れ！", note: "高速編集" },
  { id: "m49", time: 209.7, phrase: "盛れ！", note: "高速編集" },
  { id: "m50", time: 210.5, phrase: "ライライライララライララーイ", note: "高速編集" },
  { id: "m51", time: 213.6, phrase: "ライライライララライララーイ", note: "高速編集" },
  { id: "m52", time: 217.7, phrase: "M・O・R・E！", note: "高速編集" },
  { id: "m53", time: 219.4, phrase: "M・O・R・E！", note: "高速編集" },
  { id: "m54", time: 221.2, phrase: "オー！フゥ！", note: "高速編集" },
  { id: "m55", time: 225.4, phrase: "盛れ！", note: "高速編集" },
];

export const EMPTY_TIMED_CALLS: TimedCall[] = [];

const youtubeMusicSource = (videoId: string): LiveVideoConfig => ({
  videoId,
  sourceLabel: "SYNC YOUTUBE MUSIC",
  sourceDescription: "YouTube Music音源の再生位置に合わせてコールを表示します。",
  watchUrl: `https://music.youtube.com/watch?v=${videoId}`,
});

const LIVE_VIDEO_BY_SONG: Record<string, LiveVideoConfig> = {
  [normalizeSongKey("盛れ!ミ・アモーレ")]: {
    videoId: MORE_AMORE_VIDEO_ID,
    defaultCalls: MORE_AMORE_TIMED_CALLS,
  },
  [normalizeSongKey("四の五の言わず颯と別れてあげた")]: {
    videoId: "jWz3Sc4n-Zw",
  },
  [normalizeSongKey("GIRLS BE AMBITIOUS! 2026")]: {
    videoId: "SfPe376KI9I",
  },
  [normalizeSongKey("プラトニック・プラネット")]: {
    videoId: "1w7e-OAlQWE",
  },
  [normalizeSongKey("BLOODY BULLET")]: {
    videoId: "xW3p6ZmX5CA",
  },
  [normalizeSongKey("私が言う前に抱きしめなきゃね")]: {
    videoId: "RGDQLmLIsCY",
  },
  [normalizeSongKey("甘えんな")]: {
    videoId: "WvdT3_XHYIk",
  },
  [normalizeSongKey("ひとりで生きられそうって それってねえ、褒めているの?")]:
    youtubeMusicSource("-l3hTH4M7EQ"),
  [normalizeSongKey("Fiesta! Fiesta!")]: {
    videoId: "BulYnxM_23U",
  },
  [normalizeSongKey("CHOICE & CHANCE")]: {
    videoId: "a1MDCj0T0c4",
  },
  [normalizeSongKey("トウキョウ・ブラー")]: {
    videoId: "1blvz_OhPSI",
    startSeconds: 545,
    endSeconds: 804,
    sourceDescription:
      "YouTubeの09:05〜13:24にあるライブ映像に合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=1blvz_OhPSI&t=545s",
  },
  [normalizeSongKey("イジワルしないで 抱きしめてよ")]:
    youtubeMusicSource("sVNsd-Wn_UU"),
  [normalizeSongKey("素直に甘えて")]: youtubeMusicSource("NsfJvn7-aDM"),
  [normalizeSongKey("微炭酸")]: {
    videoId: "v4JVTZ3kK-Y",
    sourceDescription:
      "YouTubeのBAND Live Ver.映像に合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=v4JVTZ3kK-Y",
  },
  [normalizeSongKey("ノクチルカ")]: youtubeMusicSource("uSKuScmtrfE"),
  [normalizeSongKey("雨の中の口笛")]: youtubeMusicSource("ltsS3O29aM4"),
  [normalizeSongKey("愛・愛・傘")]: youtubeMusicSource("6Y2X6RxYnYA"),
  [normalizeSongKey("TOKYOグライダー")]: youtubeMusicSource("LZlLhbc-ARI"),
  [normalizeSongKey("伊達じゃないよ うちの人生は")]:
    youtubeMusicSource("JQ270gg4PPM"),
  [normalizeSongKey("プライド・ブライト")]: youtubeMusicSource("sjz8xSJdaUc"),
  [normalizeSongKey("Va-Va-Voom")]: youtubeMusicSource("xdw3rkeSJlA"),
  [normalizeSongKey("この世界は捨てたもんじゃない")]: {
    videoId: "lXB1gMTP-ew",
    startSeconds: 0,
    endSeconds: 293,
    sourceDescription:
      "YouTubeの00:00〜04:53にあるハロ！ステ Live Editに合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=lXB1gMTP-ew",
  },
  [normalizeSongKey("Goal〜明日はあっちだよ〜")]:
    youtubeMusicSource("QYiMYubszU8"),
  [normalizeSongKey("ナイモノラブ")]: {
    videoId: "fIQP9oPbB0U",
    sourceDescription:
      "YouTubeのConcert 2025 Queen of Hearts Special Flush映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("Never Never Surrender")]: {
    videoId: "rgUER272LsA",
    startSeconds: 1562,
    endSeconds: 1799,
    sourceDescription:
      "YouTubeの26:02〜29:59にあるハロ！ステ#468ライブ映像に合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=rgUER272LsA&t=1562s",
  },
  [normalizeSongKey("今夜はHearty Party")]: {
    videoId: "FxFGv8kvk8M",
    startSeconds: 174,
    endSeconds: 468,
    sourceDescription:
      "YouTubeの02:54〜07:48にあるハロ！ステ Live Editに合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=FxFGv8kvk8M&t=174s",
  },
  [normalizeSongKey("G.O.A.T.")]: {
    videoId: "TI6oxfA67_4",
    startSeconds: 3375,
    endSeconds: 3684,
    sourceDescription:
      "YouTubeの56:15〜1:01:24にあるハロ！ステ Live Editに合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=TI6oxfA67_4&t=3375s",
  },
  [normalizeSongKey("次々続々")]: {
    videoId: "lYw9xr9RtV4",
    sourceDescription:
      "YouTubeのライブ映像に合わせてコールを表示します。アンジュルム『次々続々』LIVE 2025.6.18 at 横浜アリーナ。",
  },
  [normalizeSongKey("マナーモード")]: {
    videoId: "cyw0mfsqZgk",
    sourceDescription:
      "YouTubeのライブ映像に合わせてコールを表示します。アンジュルム ライブツアー 2025秋 Keep Your Smile！版。",
  },
  [normalizeSongKey("Celebrate! Celebrate!")]: {
    videoId: "bH9CiWgzVLo",
    sourceDescription:
      "YouTubeのハロ！ステ Live Editに合わせてコールを表示します。",
  },
  [normalizeSongKey("BaBaBa Burning Love！")]: {
    videoId: "U0tr7ptqOUY",
    sourceDescription:
      "YouTubeのひなフェス2026 Live Ver.に合わせてコールを表示します。",
  },
  [normalizeSongKey("トラブルメーカー")]: {
    videoId: "7izkdW-52Ko",
    sourceDescription:
      "YouTubeのアンジュルム 2025 autumn Keep Your Smile！ finalライブ映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("右ななめ後ろから")]: {
    videoId: "dGz_UMQqj5s",
    sourceDescription:
      "YouTubeのアンジュルム 2025 autumn Keep Your Smile！ finalライブ映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("プリズンブレイカー")]: {
    videoId: "poKfg2NS680",
    sourceDescription:
      "YouTubeのアンジュルム 2025 autumn Keep Your Smile！ finalライブ映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("もう一歩")]: {
    videoId: "lrMj2T0mG1o",
    sourceDescription:
      "YouTubeのアンジュルム ライブツアー 2025秋 Keep Your Smile！映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("臥薪嘗胆")]: {
    videoId: "76aY8jGZMo0",
    sourceDescription:
      "YouTubeのアンジュルム ライブツアー 2025秋 Keep Your Smile！映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("FAST PASS")]: {
    videoId: "oNOybrbt3hA",
    sourceDescription:
      "YouTubeのアンジュルム ライブツアー 2025秋 Keep Your Smile！映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("限りあるMoment")]: {
    videoId: "lXB1gMTP-ew",
    startSeconds: 1600,
    endSeconds: 1887,
    sourceDescription:
      "YouTubeの26:40〜31:27にあるハロ！ステ Live Editに合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=lXB1gMTP-ew&t=1600s",
  },
  [normalizeSongKey("光のうた")]: {
    videoId: "1zhDVdNiimc",
    startSeconds: 0,
    endSeconds: 312,
    sourceDescription:
      "YouTubeの00:00〜05:12にあるハロ！ステ Live Editに合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=1zhDVdNiimc",
  },
  [normalizeSongKey("ライアーライナー")]: {
    videoId: "sDTpOztpBR0",
    sourceDescription:
      "YouTubeのハロ！ステ Live Editに合わせてコールを表示します。",
  },
  [normalizeSongKey("ちはやぶる")]: {
    videoId: "YlQEhapgvd4",
    sourceDescription:
      "YouTubeのハロ！ステ Live Editに合わせてコールを表示します。",
  },
  [normalizeSongKey("今日を胸に飾って")]: {
    videoId: "IbKd8pkTFmM",
    sourceDescription:
      "YouTubeのOCHA NORMA 2025 LIVE at BUDOKAN #OCHAnnelライブ映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("Go Your Way")]: {
    videoId: "WrDpW0sdpWg",
    sourceDescription:
      "YouTubeのOCHA NORMA LIVE TOUR 2025 ウチらの地元は日本じゃん！映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("ラヴィ・ダヴィ")]: {
    videoId: "vEdNoYxA-LQ",
    sourceDescription:
      "YouTubeのOCHA NORMA LIVE TOUR 2025 ウチらの地元は日本じゃん！映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("なんだかんだエヴリデー！")]: {
    videoId: "eRsEzAY3crw",
    sourceDescription:
      "YouTubeのOCHA NORMA LIVE TOUR 2025 ウチらの地元は日本じゃん！映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("黙ってついてこい！")]: {
    videoId: "1BvqouCDrRg",
    sourceDescription:
      "YouTubeのハロ！コン2025ライブ映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("わかってるっつーの！")]: {
    videoId: "s2wz7cggwWA",
    sourceDescription:
      "YouTubeのHello! Project ひなフェス2025ライブ映像に合わせてコールを表示します。",
  },
  [normalizeSongKey("女の愛想は武器じゃない")]: {
    videoId: "DEIbUkpIbxU",
    startSeconds: 1448,
    endSeconds: 1694,
    sourceDescription:
      "YouTubeの24:08〜28:14にある日本武道館公演映像に合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=DEIbUkpIbxU&t=1448s",
  },
  [normalizeSongKey("想定内！")]: {
    videoId: "AQl96dvqssY",
    startSeconds: 0,
    endSeconds: 258,
    sourceDescription:
      "YouTubeの00:00〜04:18にあるハロ！ステ Live Editに合わせてコールを表示します。",
    watchUrl: "https://www.youtube.com/watch?v=AQl96dvqssY",
  },
};

export const getLiveVideo = (songTitle: string) =>
  LIVE_VIDEO_BY_SONG[normalizeSongKey(songTitle)] ?? null;

export const buildYouTubeEmbedSrc = ({
  videoId,
  origin,
  startSeconds,
  endSeconds,
}: {
  videoId: string;
  origin: string;
  startSeconds?: number;
  endSeconds?: number;
}) => {
  const params = new URLSearchParams({
    enablejsapi: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    origin,
  });

  if (typeof startSeconds === "number") params.set("start", String(startSeconds));
  if (typeof endSeconds === "number") params.set("end", String(endSeconds));

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

const loadEntries = (songTitle: string, groupSlug: string): CallEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(groupSlug, songTitle));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveEntries = (
  songTitle: string,
  entries: CallEntry[],
  groupSlug: string
) => {
  window.localStorage.setItem(
    storageKey(groupSlug, songTitle),
    JSON.stringify(entries)
  );
};

export const loadTimedCalls = (
  songTitle: string,
  videoId: string,
  defaults: TimedCall[] = [],
  groupSlug = "juice-juice"
): TimedCall[] => {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(
      timedStorageKey(groupSlug, songTitle, videoId)
    );
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaults;
    if (parsed.length === 0 && defaults.length > 0) return defaults;
    return parsed;
  } catch {
    return defaults;
  }
};

export const saveTimedCalls = (
  songTitle: string,
  videoId: string,
  calls: TimedCall[],
  groupSlug = "juice-juice"
) => {
  window.localStorage.setItem(
    timedStorageKey(groupSlug, songTitle, videoId),
    JSON.stringify(calls)
  );
};

export const formatSeconds = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
};

export const parseTimeInput = (value: string): number | null => {
  const clean = value.trim();
  if (!clean) return null;

  const parts = clean.split(":").map((part) => part.trim());
  if (parts.length === 1) {
    const seconds = Number(parts[0]);
    return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
  }

  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (
      Number.isFinite(minutes) &&
      Number.isFinite(seconds) &&
      minutes >= 0 &&
      seconds >= 0
    ) {
      return minutes * 60 + seconds;
    }
  }

  return null;
};

export default function SongCallLab({
  songTitle,
  editHref,
  groupSlug = "juice-juice",
}: {
  songTitle: string;
  editHref?: string;
  groupSlug?: string;
}) {
  const [entries, setEntries] = useState<CallEntry[]>([]);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [phrase, setPhrase] = useState("");
  const [timing, setTiming] = useState("");
  const [note, setNote] = useState("");
  const [bpm, setBpm] = useState(120);
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setEntries(loadEntries(songTitle, groupSlug));
  }, [songTitle, groupSlug]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (response): Promise<AuthState | null> =>
        response.ok ? ((await response.json()) as AuthState) : null
      )
      .then((data) => {
        if (!cancelled) setAuth(data);
      })
      .catch(() => {
        if (!cancelled) setAuth({ user: null, role: null, canEdit: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    const intervalMs = Math.max(240, Math.round((60 / bpm) * 1000));
    intervalRef.current = window.setInterval(() => {
      setStep((current) => current + 1);
    }, intervalMs);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [bpm, isRunning]);

  const sequence = useMemo(() => {
    const userPhrases = entries
      .map((entry) => entry.phrase.trim())
      .filter(Boolean);
    return userPhrases.length > 0 ? userPhrases : buildDefaultSequence(songTitle);
  }, [entries, songTitle]);

  const liveVideo = useMemo(() => getLiveVideo(songTitle), [songTitle]);

  const activeIndex = step % sequence.length;
  const activeCall = sequence[activeIndex] ?? "Oi!";

  const addEntry = () => {
    const cleanPhrase = phrase.trim();
    if (!cleanPhrase) return;

    const next = [
      createEntry({
        phrase: cleanPhrase,
        timing: timing.trim(),
        note: note.trim(),
      }),
      ...entries,
    ];
    setEntries(next);
    saveEntries(songTitle, next, groupSlug);
    setPhrase("");
    setTiming("");
    setNote("");
  };

  const removeEntry = (id: string) => {
    const next = entries.filter((entry) => entry.id !== id);
    setEntries(next);
    saveEntries(songTitle, next, groupSlug);
  };

  const resetPractice = () => {
    setIsRunning(false);
    setStep(0);
    setHitCount(0);
  };

  return (
    <section className="mb-8">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-semibold tracking-[0.25em] text-ink-weak">
            ♪ CALL PRACTICE
          </h2>
          <p className="mt-1 text-xs text-ink-weak">
            書き込んだコールを使って、一定テンポで練習できます。
          </p>
        </div>
        <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono text-[10px] text-accent">
          local save
        </span>
      </div>

      {liveVideo && (
        <>
          <CallHistoryPanel
            songTitle={songTitle}
            videoId={liveVideo.videoId}
            groupSlug={groupSlug}
            auth={auth}
          />
          <SyncedCallPlayer
            songTitle={songTitle}
            videoId={liveVideo.videoId}
            startSeconds={liveVideo.startSeconds}
            endSeconds={liveVideo.endSeconds}
            defaultCalls={liveVideo.defaultCalls ?? EMPTY_TIMED_CALLS}
            sourceLabel={liveVideo.sourceLabel}
            sourceDescription={liveVideo.sourceDescription}
            watchUrl={liveVideo.watchUrl}
            auth={auth}
            editHref={editHref}
            groupSlug={groupSlug}
          />
        </>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
            <p className="font-mono text-[10px] tracking-[0.25em] text-ink-weak">
              NEXT CALL
            </p>
            <p className="mt-3 min-h-12 break-words text-3xl font-bold leading-tight text-ink">
              {activeCall}
            </p>
            <p className="mt-2 font-mono text-[11px] text-ink-weak">
              {activeIndex + 1} / {sequence.length}
            </p>
          </div>

          <label className="mt-4 block text-[11px] font-semibold text-ink-weak">
            BPM
            <input
              type="range"
              min="80"
              max="180"
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </label>
          <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-ink-weak">
            <span>80</span>
            <span className="text-ink">{bpm}</span>
            <span>180</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setIsRunning((current) => !current)}
              className="rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent/90"
            >
              {isRunning ? "停止" : "開始"}
            </button>
            <button
              type="button"
              onClick={() => setHitCount((count) => count + 1)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-ink transition hover:border-accent"
            >
              言えた
            </button>
            <button
              type="button"
              onClick={resetPractice}
              className="rounded-md border border-border bg-white px-3 py-2 text-xs text-ink-weak transition hover:border-ink/30 hover:text-ink"
            >
              リセット
            </button>
          </div>

          <p className="mt-3 text-center font-mono text-[11px] text-ink-weak">
            success {hitCount}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4">
          <h3 className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-ink-weak">
            PRIVATE MEMO
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-ink-weak">
            このメモは自分のブラウザだけに保存され、他のユーザーには表示されません。
          </p>

          <div className="space-y-2">
            <input
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              placeholder="例: Oi! / Fu! / はいせーの"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
            />
            <input
              value={timing}
              onChange={(event) => setTiming(event.target.value)}
              placeholder="タイミング: イントロ / 2A / サビ前 など"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
            />
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="補足メモ"
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
            />
            <button
              type="button"
              onClick={addEntry}
              disabled={!phrase.trim()}
              className="w-full rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-weak"
            >
              コールを書き込む
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {entries.length === 0 ? (
              <li className="rounded-lg border border-dashed border-border bg-surface px-3 py-4 text-center text-xs text-ink-weak">
                まだ書き込みはありません
              </li>
            ) : (
              entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-border bg-surface/70 px-3 py-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-ink">
                        {entry.phrase}
                      </p>
                      {entry.timing && (
                        <p className="mt-1 text-[11px] text-accent">
                          {entry.timing}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry.id)}
                      className="shrink-0 rounded-full border border-border bg-white px-2 py-0.5 text-[10px] text-ink-weak transition hover:border-ink/30 hover:text-ink"
                    >
                      削除
                    </button>
                  </div>
                  {entry.note && (
                    <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-ink-weak">
                      {entry.note}
                    </p>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CallHistoryPanel({
  songTitle,
  videoId,
  groupSlug,
  auth,
}: {
  songTitle: string;
  videoId: string;
  groupSlug: string;
  auth: AuthState | null;
}) {
  const callVersion = "beginner";
  const canEdit = auth?.canEdit ?? false;
  const [notes, setNotes] = useState<CallHistoryNote[]>([]);
  const [draftBody, setDraftBody] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [draftSourceLabel, setDraftSourceLabel] = useState("");
  const [draftSourceUrl, setDraftSourceUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      groupSlug,
      songTitle,
      videoId,
      callVersion,
    });

    fetch(`/api/call-history?${params.toString()}`)
      .then(async (response): Promise<{ notes?: CallHistoryNote[] } | null> =>
        response.ok
          ? ((await response.json()) as { notes?: CallHistoryNote[] })
          : null
      )
      .then((data) => {
        if (cancelled || !data?.notes) return;
        setNotes(data.notes);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [callVersion, groupSlug, songTitle, videoId]);

  const saveNotes = async (next: CallHistoryNote[]) => {
    if (!canEdit) return;
    setIsSaving(true);
    setStatus(null);

    const normalized = next
      .map((note) => ({
        ...note,
        body: note.body.trim(),
        eventDate: note.eventDate.trim(),
        sourceLabel: note.sourceLabel.trim(),
        sourceUrl: note.sourceUrl.trim(),
      }))
      .filter((note) => note.body);

    setNotes(normalized);

    try {
      const response = await fetch("/api/call-history", {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          groupSlug,
          songTitle,
          videoId,
          callVersion,
          notes: normalized,
        }),
      });
      if (!response.ok) throw new Error("save_failed");
      setStatus("保存しました");
    } catch {
      setStatus("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const addNote = () => {
    if (!canEdit || !draftBody.trim()) return;
    const note: CallHistoryNote = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      eventDate: draftDate,
      body: draftBody,
      sourceLabel: draftSourceLabel,
      sourceUrl: draftSourceUrl,
    };
    void saveNotes([note, ...notes]);
    setDraftBody("");
    setDraftDate("");
    setDraftSourceLabel("");
    setDraftSourceUrl("");
  };

  const removeNote = (id: string) => {
    if (!canEdit) return;
    void saveNotes(notes.filter((note) => note.id !== id));
  };

  if (!canEdit && notes.length === 0) return null;

  return (
    <div className="mb-5 rounded-2xl border border-border bg-white p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-semibold tracking-[0.22em] text-ink-weak">
            ♪ CALL HISTORY
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-weak">
            この曲のコールが追加・変化した背景メモです。曲・動画・初心者版ごとに管理します。
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-ink-weak">
          {canEdit ? "編集可" : "閲覧のみ"}
        </span>
      </div>

      {notes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface px-3 py-4 text-center text-xs text-ink-weak">
          まだコール履歴メモはありません。
        </p>
      ) : (
        <ol className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border bg-surface/70 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {note.eventDate && (
                    <p className="font-mono text-[10px] text-accent">
                      {note.eventDate}
                    </p>
                  )}
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
                    {note.body}
                  </p>
                  {(note.sourceLabel || note.sourceUrl) && (
                    <p className="mt-2 text-[11px] text-ink-weak">
                      参考:{" "}
                      {note.sourceUrl ? (
                        <a
                          href={note.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline-offset-2 hover:underline"
                        >
                          {note.sourceLabel || note.sourceUrl} ↗
                        </a>
                      ) : (
                        note.sourceLabel
                      )}
                    </p>
                  )}
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => removeNote(note.id)}
                    disabled={isSaving}
                    className="shrink-0 rounded-full border border-border bg-white px-2 py-0.5 text-[10px] text-ink-weak transition hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    削除
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {canEdit && (
        <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 p-3">
          <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-ink-weak">
            HISTORY MEMO EDIT
          </p>
          <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
            <input
              value={draftDate}
              onChange={(event) => setDraftDate(event.target.value)}
              placeholder="例: 2025秋 仙台"
              className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
            />
            <input
              value={draftSourceLabel}
              onChange={(event) => setDraftSourceLabel(event.target.value)}
              placeholder="参考ラベル任意"
              className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
            />
          </div>
          <input
            value={draftSourceUrl}
            onChange={(event) => setDraftSourceUrl(event.target.value)}
            placeholder="参考URL任意"
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
          />
          <textarea
            value={draftBody}
            onChange={(event) => setDraftBody(event.target.value)}
            rows={3}
            placeholder="例: 最後のヲタク歌唱は、2025年秋ツアー仙台公演からメンバー希望で増えた。"
            className="mt-2 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addNote}
              disabled={isSaving || !draftBody.trim()}
              className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-weak"
            >
              履歴メモを追加
            </button>
            {status && (
              <span className="text-[11px] text-ink-weak">{status}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SyncedCallPlayer({
  songTitle,
  videoId,
  startSeconds,
  endSeconds,
  defaultCalls,
  sourceLabel,
  sourceDescription,
  watchUrl: sourceWatchUrl,
  auth,
  editHref,
  groupSlug,
}: {
  songTitle: string;
  videoId: string;
  startSeconds?: number;
  endSeconds?: number;
  defaultCalls: TimedCall[];
  sourceLabel?: string;
  sourceDescription?: string;
  watchUrl?: string;
  auth: AuthState | null;
  editHref?: string;
  groupSlug: string;
}) {
  const reactId = useId();
  const playerElementId = `yt-player-${reactId.replace(/:/g, "")}`;
  const playerRef = useRef<YouTubePlayer | null>(null);
  const pollRef = useRef<number | null>(null);
  const spokenRef = useRef<string | null>(null);
  const [timedCalls, setTimedCalls] = useState<TimedCall[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState("オイ！");
  const [newPhrase, setNewPhrase] = useState("");
  const [newTime, setNewTime] = useState("");
  const [browserOrigin, setBrowserOrigin] = useState<string | null>(null);
  const [playerStatus, setPlayerStatus] = useState<"loading" | "ready" | "manual">(
    "loading"
  );
  const embedSrc = browserOrigin
    ? buildYouTubeEmbedSrc({
        videoId,
        origin: browserOrigin,
        startSeconds,
        endSeconds,
      })
    : null;
  const watchUrl = sourceWatchUrl ?? `https://www.youtube.com/watch?v=${videoId}`;
  const canEdit = auth?.canEdit ?? false;
  const commonPhraseGroups = useMemo(
    () => [
      {
        label: "汎用",
        phrases: GENERAL_TEMPLATES.map((template) => template.phrase),
      },
      {
        label: "メンバー名",
        phrases: MEMBER_TEMPLATES.map((template) => template.phrase),
      },
    ],
    []
  );

  useEffect(() => {
    setBrowserOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fallback = loadTimedCalls(songTitle, videoId, defaultCalls, groupSlug);
    setTimedCalls(fallback);

    fetch(
      `/api/calls?songTitle=${encodeURIComponent(songTitle)}&videoId=${encodeURIComponent(
        videoId
      )}`
    )
      .then(async (response): Promise<{ calls?: TimedCall[] } | null> =>
        response.ok ? ((await response.json()) as { calls?: TimedCall[] }) : null
      )
      .then((data) => {
        if (cancelled || !data?.calls || data.calls.length === 0) return;
        setTimedCalls(data.calls);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [songTitle, videoId, defaultCalls, groupSlug]);

  useEffect(() => {
    if (!embedSrc) return;
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled || !window.YT || playerRef.current) return;
      if (!document.getElementById(playerElementId)) return;
      playerRef.current = new window.YT.Player(playerElementId, {
        events: {
          onReady: () => {
            setIsReady(true);
            setPlayerStatus("ready");
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };
    }

    const fallback = window.setTimeout(() => {
      if (!playerRef.current) setPlayerStatus("manual");
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [embedSrc, playerElementId]);

  const activeCall = useMemo(() => {
    const sorted = timedCalls.slice().sort((a, b) => a.time - b.time);
    return sorted.find(
      (call) => currentTime >= call.time && currentTime < call.time + 1.4
    );
  }, [currentTime, timedCalls]);

  const nextCall = useMemo(
    () =>
      timedCalls
        .slice()
        .sort((a, b) => a.time - b.time)
        .find((call) => call.time > currentTime),
    [currentTime, timedCalls]
  );

  useEffect(() => {
    if (!isReady || pollRef.current) return;

    pollRef.current = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      const time = player.getCurrentTime();
      setCurrentTime(time);

      const playingState = window.YT?.PlayerState?.PLAYING ?? 1;
      if (player.getPlayerState() !== playingState) return;

      if (typeof endSeconds === "number" && time >= endSeconds) {
        player.pauseVideo();
        player.seekTo(endSeconds, false);
        setCurrentTime(endSeconds);
        return;
      }

      const due = timedCalls
        .slice()
        .sort((a, b) => a.time - b.time)
        .find((call) => time >= call.time && time < call.time + 0.45);

      if (!due || spokenRef.current === due.id) return;
      spokenRef.current = due.id;

      if (voiceEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(due.phrase);
        utterance.lang = "ja-JP";
        utterance.rate = 1.18;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    }, 120);

    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [endSeconds, isReady, timedCalls, voiceEnabled]);

  const updateTimedCalls = (next: TimedCall[]) => {
    const sorted = next.slice().sort((a, b) => a.time - b.time);
    setTimedCalls(sorted);
    saveTimedCalls(songTitle, videoId, sorted, groupSlug);
    if (canEdit) {
      void fetch("/api/calls", {
        method: "PUT",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          songTitle,
          videoId,
          calls: sorted,
        }),
      }).catch(() => undefined);
    }
  };

  const seekTo = (seconds: number) => {
    playerRef.current?.seekTo(Math.max(0, seconds), true);
    spokenRef.current = null;
  };

  const shiftAll = (delta: number) => {
    if (!canEdit) return;
    updateTimedCalls(
      timedCalls.map((call) => ({
        ...call,
        time: Math.max(0, Number((call.time + delta).toFixed(1))),
      }))
    );
  };

  const addCurrentCall = () => {
    if (!canEdit) return;
    const clean = newPhrase.trim();
    if (!clean) return;
    const parsedTime = parseTimeInput(newTime);
    updateTimedCalls([
      ...timedCalls,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        time: Number((parsedTime ?? currentTime).toFixed(1)),
        phrase: clean,
        note: "手動追加",
      },
    ]);
    setNewPhrase("");
    setNewTime("");
  };

  const addSelectedCallNow = () => {
    if (!canEdit) return;
    const clean = selectedPhrase.trim();
    if (!clean) return;
    updateTimedCalls([
      ...timedCalls,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        time: Number(currentTime.toFixed(1)),
        phrase: clean,
        note: "ここ！で追加",
      },
    ]);
  };

  const nudgeCall = (id: string, delta: number) => {
    if (!canEdit) return;
    updateTimedCalls(
      timedCalls.map((call) =>
        call.id === id
          ? { ...call, time: Math.max(0, Number((call.time + delta).toFixed(1))) }
          : call
      )
    );
  };

  const setCallTime = (id: string, value: string) => {
    if (!canEdit) return;
    const parsed = parseTimeInput(value);
    if (parsed === null) return;

    updateTimedCalls(
      timedCalls.map((call) =>
        call.id === id
          ? { ...call, time: Math.max(0, Number(parsed.toFixed(1))) }
          : call
      )
    );
  };

  const removeCall = (id: string) => {
    if (!canEdit) return;
    updateTimedCalls(timedCalls.filter((call) => call.id !== id));
  };

  const resetCalls = () => {
    if (!canEdit) return;
    spokenRef.current = null;
    updateTimedCalls(defaultCalls);
  };

  return (
    <div className="mb-5 rounded-2xl border border-accent/30 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-semibold tracking-[0.22em] text-ink-weak">
            {sourceLabel ?? "SYNC LIVE VIDEO"}
          </h3>
          <p className="mt-1 text-xs text-ink-weak">
            {sourceDescription ?? "YouTubeの再生位置に合わせてコールを表示します。"}
          </p>
          <p className="mt-1 text-[11px] text-ink-weak">
            ※Spotify連携の場合は仕様上、±0.3〜1秒くらいのズレが発生します。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {auth?.user ? (
            <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-ink-weak">
              @{auth.user.username} {canEdit ? "編集可" : "閲覧のみ"}
            </span>
          ) : (
            <a
              href="/api/auth/x/start"
              className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white transition hover:bg-ink/90"
            >
              Xでログイン
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              setVoiceEnabled((enabled) => !enabled);
              window.speechSynthesis?.cancel();
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              voiceEnabled
                ? "bg-accent text-white"
                : "border border-border bg-surface text-ink-weak hover:border-accent hover:text-accent"
            }`}
          >
            コール音声 {voiceEnabled ? "ON" : "OFF"}
          </button>
          {editHref && auth?.canEdit && (
            <a
              href={editHref}
              className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white transition hover:bg-accent/90"
            >
              高速編集
            </a>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-ink">
        {embedSrc ? (
          <iframe
            id={playerElementId}
            className="relative z-0 block aspect-video min-h-[220px] w-full sm:min-h-[360px]"
            src={embedSrc}
            title={`${songTitle} sync source`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="aspect-video min-h-[220px] w-full sm:min-h-[360px]" />
        )}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/10 px-4 text-center">
          <p
            className={`max-w-[92%] break-words rounded-xl bg-black/60 px-4 py-3 text-3xl font-black leading-tight text-white shadow-[0_2px_18px_rgba(0,0,0,0.45)] ring-1 ring-white/20 transition sm:text-4xl ${
              activeCall ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            style={{
              textShadow:
                "0 2px 0 rgba(0,0,0,0.45), 0 0 18px rgba(200,111,94,0.65)",
            }}
          >
            {activeCall?.phrase ?? "待機"}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-weak">
        埋め込みが表示されない場合は{" "}
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline-offset-2 hover:underline"
        >
          {sourceWatchUrl?.includes("music.youtube.com")
            ? "YouTube Musicで開く ↗"
            : "YouTubeで開く ↗"}
        </a>
        {playerStatus !== "ready" && (
          <span className="ml-2">
            再生位置の自動取得が始まらない場合は、下の秒数ボタンで確認してください。
          </span>
        )}
      </p>

      <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.22em] text-ink-weak">
          {formatSeconds(currentTime)}
        </p>
        <p className="mt-2 min-h-10 break-words text-2xl font-bold leading-tight text-ink">
          {activeCall?.phrase ?? "待機"}
        </p>
        <p className="mt-1 text-[11px] text-ink-weak">
          次: {nextCall ? `${formatSeconds(nextCall.time)} ${nextCall.phrase}` : "なし"}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => shiftAll(-0.5)}
          disabled={!canEdit}
          className="rounded-md border border-border bg-white px-2.5 py-1 text-[11px] text-ink-weak transition hover:border-accent hover:text-accent"
        >
          全体 -0.5秒
        </button>
        <button
          type="button"
          onClick={() => shiftAll(0.5)}
          disabled={!canEdit}
          className="rounded-md border border-border bg-white px-2.5 py-1 text-[11px] text-ink-weak transition hover:border-accent hover:text-accent"
        >
          全体 +0.5秒
        </button>
        <button
          type="button"
          onClick={resetCalls}
          disabled={!canEdit}
          className="rounded-md border border-border bg-white px-2.5 py-1 text-[11px] text-ink-weak transition hover:border-ink/30 hover:text-ink"
        >
          初期値に戻す
        </button>
      </div>

      {!canEdit && (
        <p className="mt-2 rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-xs text-ink-weak">
          コールタイムラインの編集は許可されたXアカウントのみ可能です。
        </p>
      )}

      <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 p-3">
        <div className="mb-3 space-y-2">
          {commonPhraseGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-ink-weak">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.phrases.map((phrase) => (
                  <button
                    key={`${group.label}-${phrase}`}
                    type="button"
                    onClick={() => setSelectedPhrase(phrase)}
                    disabled={!canEdit}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                      selectedPhrase === phrase
                        ? "border-accent bg-accent text-white"
                        : "border-border bg-white text-ink hover:border-accent"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addSelectedCallNow}
          disabled={!canEdit}
          className="w-full rounded-xl bg-accent px-4 py-3 text-xl font-black text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-weak"
        >
          ここ！
        </button>
        <p className="mt-2 text-[11px] text-ink-weak">
          選択中のコール「{selectedPhrase}」を現在の再生位置に追加します。
        </p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[96px_1fr_auto]">
        <input
          value={newTime}
          onChange={(event) => setNewTime(event.target.value)}
          disabled={!canEdit}
          placeholder={formatSeconds(currentTime)}
          className="rounded-md border border-border bg-white px-3 py-2 font-mono text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
          inputMode="decimal"
          aria-label="追加するコールの秒数"
        />
        <input
          value={newPhrase}
          onChange={(event) => setNewPhrase(event.target.value)}
          disabled={!canEdit}
          placeholder="指定秒に追加するコール"
          className="min-w-0 flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-weak/60 focus:border-accent"
        />
        <button
          type="button"
          onClick={addCurrentCall}
          disabled={!canEdit || !newPhrase.trim()}
          className="shrink-0 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-weak"
        >
          追加
        </button>
      </div>
      <p className="mt-1 text-[11px] text-ink-weak">
        秒数は `83.2` または `1:23.2` の形式で指定できます。空欄なら現在秒に追加します。
      </p>

      <ol className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1 text-sm">
        {timedCalls.map((call) => {
          const isActive = activeCall?.id === call.id;
          return (
            <li
              key={call.id}
              className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                isActive
                  ? "border-accent bg-accent/10"
                  : "border-border bg-surface/70"
              }`}
            >
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => seekTo(call.time)}
                  className="w-14 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-accent transition hover:bg-accent hover:text-white"
                  title="この秒数へ移動"
                >
                  {formatSeconds(call.time)}
                </button>
                <input
                  defaultValue={formatSeconds(call.time)}
                  onBlur={(event) => setCallTime(call.id, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    }
                  }}
                  className="w-16 rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[11px] text-ink outline-none transition focus:border-accent"
                  inputMode="decimal"
                  disabled={!canEdit}
                  aria-label={`${call.phrase} の表示秒数`}
                />
              </div>
              <span className="min-w-0 flex-1 break-words font-semibold text-ink">
                {call.phrase}
              </span>
              <button
                type="button"
                onClick={() => nudgeCall(call.id, -0.1)}
                disabled={!canEdit}
                className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] text-ink-weak transition hover:border-accent hover:text-accent"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => nudgeCall(call.id, 0.1)}
                disabled={!canEdit}
                className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] text-ink-weak transition hover:border-accent hover:text-accent"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => removeCall(call.id)}
                disabled={!canEdit}
                className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] text-ink-weak transition hover:border-ink/30 hover:text-ink"
              >
                削除
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
