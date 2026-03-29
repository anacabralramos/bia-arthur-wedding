import type { Metadata } from "next";
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

/** Base URL for og:image, og:url, etc. Must match the domain people share (each Vercel deployment has its own VERCEL_URL). */
function getMetadataBase(): URL {
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

const metadataBase = getMetadataBase();

export const metadata: Metadata = {
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
    url: metadataBase.origin,
    images: [
      {
        url: "/og-image.png",
        width: 100,
        height: 100,
        type: "image/png",
        alt: "Casamento Bia e Arthur",
      },
    ],
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
    images: ["/og-image.png"],
  },
};

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
