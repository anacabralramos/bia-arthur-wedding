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

export const metadata: Metadata = {
  // Remova a barra do final aqui
  metadataBase: new URL("https://anabeatriz-arthur-wedding.vercel.app"),

  title: "Bia e Arthur — Casamento",
  description:
    "Site do casamento de Bia e Arthur — contagem regressiva e lista de presentes.",

  openGraph: {
    title: "Bia e Arthur — Casamento",
    description:
      "Site do casamento de Bia e Arthur — contagem regressiva e lista de presentes.",
    locale: "pt_BR",
    type: "website",
    url: "https://anabeatriz-arthur-wedding.vercel.app",
    images: [
      {
        // Use o caminho relativo. O Next.js vai unir com a metadataBase
        // gerando o link PERFEITO com uma barra só.
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Casamento Bia e Arthur",
      },
    ],
  },
  // Aproveite para matar o ícone da Vercel na aba do navegador também:
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bia e Arthur — Casamento",
    description:
      "Site do casamento de Bia e Arthur — contagem regressiva e lista de presentes.",
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
