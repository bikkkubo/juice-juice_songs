import { ImageResponse } from "next/og";
import releasesData from "@/data/releases.json";
import membersData from "@/data/members.json";

export const dynamic = "force-static";
export const alt = "Juice=Juice Discography Timeline";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const releaseCount = releasesData.length;
  const memberCount = membersData.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #FFF8F2 0%, #F6F2EB 60%, #EBB8AB 100%)",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 28,
              color: "#6E655E",
              letterSpacing: 6,
              fontWeight: 600,
            }}
          >
            JUICE=JUICE
          </div>
          <div
            style={{
              fontSize: 110,
              color: "#2B2A28",
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Discography
          </div>
          <div
            style={{
              fontSize: 110,
              color: "#C86F5E",
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            Timeline
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            color: "#2B2A28",
            fontSize: 30,
            fontWeight: 600,
          }}
        >
          <Stat label="releases" value={releaseCount} dotColor="#EB5A8C" />
          <Stat label="members" value={memberCount} dotColor="#A78BFA" />
          <Stat label="2013–Now" value="" dotColor="#22C55E" />
        </div>
      </div>
    ),
    { ...size }
  );
}

function Stat({
  label,
  value,
  dotColor,
}: {
  label: string;
  value: number | string;
  dotColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#ffffffcc",
        padding: "12px 22px",
        borderRadius: 999,
        border: "1px solid #E7E2DA",
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: dotColor,
        }}
      />
      {value !== "" && <span>{value}</span>}
      <span style={{ color: "#6E655E", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
