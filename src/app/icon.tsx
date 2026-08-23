import { ImageResponse } from "next/og";

/**
 * Favicon modern (servit ca <link rel="icon">) — "!" din culoarea de accent pe fond ink,
 * ca fix la citația/amenda din poveste. Vezi și `apple-icon.tsx` (touch icon) și
 * `favicon.ico` (fallback static pentru browsere care cer direct /favicon.ico).
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 24,
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
