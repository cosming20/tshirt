import { ImageResponse } from "next/og";

/** Touch icon iOS (Add to Home Screen) — aceeași marcă ca `icon.tsx`, la 180×180. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0c11",
          color: "#5a31f4",
          fontSize: 130,
          fontWeight: 900,
          fontFamily: "sans-serif",
        }}
      >
        !
      </div>
    ),
    size,
  );
}
