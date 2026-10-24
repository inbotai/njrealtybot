import { ImageResponse } from "next/og";

export const alt = "Garden State AI — NJ Real Estate, Property Tax Appeal, Home Valuation and AI Search";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #071426 0%, #12315c 55%, #0b1f3a 100%)",
          color: "white",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 18,
              height: 64,
              background: "#e0b33a",
              borderRadius: 4,
            }}
          />
          <div style={{ display: "flex", fontSize: 36, letterSpacing: 2, color: "#e0b33a", fontWeight: 700 }}>
            GARDEN STATE AI
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>
            New Jersey Real Estate
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#f3e2ae" }}>
            Property Tax Appeal · Home Valuation · AI Search
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#c9d4e5" }}>
          gardenstate.ai
        </div>
      </div>
    ),
    { ...size },
  );
}
