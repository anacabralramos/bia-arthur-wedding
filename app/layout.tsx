import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-wedding-display",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-wedding-body",
});

/** Fallback when `headers()` has no host (e.g. some static analysis). */
function metadataBaseFromEnv(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (raw) {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProtocol);
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL("http://localhost:3000");
}

/**
 * WhatsApp/Facebook resolve og:image against metadataBase. If the build ran without VERCEL_URL
 * (deploy from local `vercel build`), base was localhost and scrapers ignored the image.
 * Using the request host fixes the absolute URL for every deployment URL.
 */
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const rawHost =
    h.get("x-forwarded-host")?.split(",", 1)[0]?.trim() ||
    h.get("host")?.trim() ||
    "";
  const forwardedProto = h.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();

  let metadataBase: URL;
  const host = rawHost.replace(/^https?:\/\//i, "").split("/")[0] || rawHost;
  if (host) {
    const proto =
      forwardedProto ||
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    metadataBase = new URL(`${proto}://${host}`);
  } else {
    metadataBase = metadataBaseFromEnv();
  }

  const canonical = metadataBase.href.replace(/\/+$/, "");

  return {
    metadataBase,
    title: "Bia e Arthur — Casamento",
    description:
      "Site do casamento de Bia e Arthur — contagem regressiva e lista de presentes.",
    openGraph: {
      title: "Bia e Arthur — Casamento",
      description:
        "Site do casamento de Bia e Arthur — contagem regressiva e lista de presentes.",
      locale: "pt_BR",
      type: "website",
      url: canonical,
    },
    icons: {
      icon: "/og-image.png",
      apple: "/og-image.png",
    },
    twitter: {
      card: "summary_large_image",
      title: "Bia e Arthur — Casamento",
      description:
        "Site do casamento de Bia e Arthur — contagem regressiva e lista de presentes.",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className={`${dmSans.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
