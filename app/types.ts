export type ReleaseType = "indie" | "single" | "album" | "digital";

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

export type Member = {
  name: string;
  color: string;
  joined: string;
  left: string | null;
  note?: string;
};
