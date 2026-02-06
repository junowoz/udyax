import type { Metadata } from "next";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "plottable/plottable.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://udyax.com"),
  title: "UDYAX — CityOS",
  description:
    "Infraestrutura urbana de dados e governança para prefeituras e governos estaduais.",
  openGraph: {
    title: "UDYAX — CityOS",
    description:
      "Infraestrutura urbana de dados e governança para prefeituras e governos estaduais.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "UDYAX — CityOS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UDYAX — CityOS",
    description:
      "Infraestrutura urbana de dados e governança para prefeituras e governos estaduais.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
