import type { Metadata } from "next";
import type { Group } from "./types";

export const ROOT_SITE_NAME = "ハロプロコール練習サイト";

const ogImage = {
  url: "/api/og-image",
  width: 1200,
  height: 630,
};

export const groupSiteName = (group: Group): string =>
  `${group.name}コール練習サイト`;

export const rootOpenGraph = {
  title: ROOT_SITE_NAME,
  description:
    "ライブ映像や音源に合わせてハロー！プロジェクト楽曲のコールを練習できます。",
  locale: "ja_JP",
  type: "website" as const,
  url: "/",
  siteName: ROOT_SITE_NAME,
  images: [{ ...ogImage, alt: ROOT_SITE_NAME }],
};

export const groupMetadata = ({
  group,
  title,
  description,
  path,
  type = "website",
  robots,
}: {
  group: Group;
  title?: string;
  description: string;
  path: string;
  type?: "website" | "music.song";
  robots?: Metadata["robots"];
}): Metadata => {
  const siteName = groupSiteName(group);
  const fullTitle = title ? `${title} - ${siteName}` : siteName;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName,
      locale: "ja_JP",
      type,
      images: [{ ...ogImage, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
    ...(robots ? { robots } : {}),
  };
};
