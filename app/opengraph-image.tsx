import { ImageResponse } from "next/og";
import { shareImage, siteName } from "@/lib/seo";

export const alt = shareImage.alt;
export const size = { width: shareImage.width, height: shareImage.height };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{
        display: "flex", width: "100%", height: "100%", padding: 48,
        background: "#e2dafa", color: "#151515",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, width: "100%",
          padding: "48px 68px", border: "5px solid #151515", boxShadow: "12px 12px 0 #151515",
          background: "#faf8f1",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 110, fontWeight: 800 }}>
            {siteName}
            <div style={{ display: "flex", width: 25, height: 25, marginTop: 66, background: "#ff5530" }} />
          </div>
          <div style={{ display: "flex", fontSize: 40 }}>Copy-ready AI recipes and agent skills</div>
        </div>
      </div>
    ),
    size,
  );
}
