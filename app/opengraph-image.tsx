import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Bia e Arthur — Casamento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 1200×630 raster for Facebook/WhatsApp (they often ignore very small static og-image files). */
export default async function OpenGraphImage() {
  const buf = await readFile(join(process.cwd(), "public/og-image.png"));
  const src = `data:image/png;base64,${buf.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f5",
        }}
      >
        <img src={src} width={420} height={420} alt="" />
      </div>
    ),
    { ...size },
  );
}
