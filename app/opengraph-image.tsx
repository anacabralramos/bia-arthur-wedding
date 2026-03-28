import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Bia e Arthur — Casamento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * WhatsApp and other apps use og:image (PNG), not the tab icon.
 * We embed app/icon.svg so the preview matches the favicon pixel-for-pixel when rasterized.
 */
export default async function OpenGraphImage() {
  const svg = await readFile(join(process.cwd(), "app/icon.svg"), "utf8");
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

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
        {/* Scale favicon art for 1200×630 preview */}
        <img src={src} width={360} height={360} alt="" />
      </div>
    ),
    { ...size },
  );
}
