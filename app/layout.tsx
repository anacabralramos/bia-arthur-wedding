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
  metadataBase: new URL("https://anabeatriz-arthur-wedding.vercel.app/"),
  title: "Bia e Arthur — Casamento",
  description:
    "Site do casamento de Bia e Arthur — contagem regressiva e lista de presentes.",
  openGraph: {
    title: "Bia e Arthur — Casamento",
    description:
      "Site do casamento de Bia e Arthur — contagem regressiva e lista de presentes.",
    locale: "pt_BR",
    type: "website",
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
