import { ImageResponse } from "next/og";
import { PRODUCT } from "@/lib/product";

export const alt = `${PRODUCT.name} — ${PRODUCT.nav.brand}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0d0c11",
          color: "#f4f2ec",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            color: "#d6ff3f",
          }}
        >
          {PRODUCT.eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 104,
            fontWeight: 900,
            lineHeight: 1.02,
            textTransform: "uppercase",
            maxWidth: 980,
          }}
        >
          {PRODUCT.name}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#a8a6b3" }}>
          {PRODUCT.eyebrow}
        </div>
      </div>
    ),
    size,
  );
}
