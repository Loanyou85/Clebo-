import { ImageResponse } from "next/og";

// Icône Clebo générée par code : rond orange avec une patte.
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
          borderRadius: "50%",
          background: "#f97316",
          fontSize: 20,
        }}
      >
        🐾
      </div>
    ),
    { ...size }
  );
}
