export type ReleaseType = "indie" | "single" | "album" | "digital" | "unreleased";

export type Release = {
  id: string;
  title: string;
  type: ReleaseType;
  typeLabel: string;
  releaseDate: string;
  tracks: string[];
  lineup: string[];
  links?: {
    youtube?: string;
    apple?: string;
    spotify?: string;
    official?: string;
  };
  cover?: string;
  note?: string;
};

export type SongCredits = {
  lyricist?: string;
  composer?: string;
  arranger?: string;
};

export type Member = {
  name: string;
  reading?: string;
  nickname?: string;
  birthday?: string;
  bloodType?: string;
  height?: string;
  birthplace?: string;
  color: string;
  joined: string;
  left: string | null;
  isTrainee?: boolean;
  graduationVenue?: string;
  note?: string;
};

export type Group = {
  slug: string;
  name: string;
  shortName: string;
  artistKeyword: string;
  officialUrl?: string;
};
