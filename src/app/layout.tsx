import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hisaab Sathi",
    template: "%s | Hisaab Sathi",
  },

  description:
    "Simple daily closing and sales records for Nepali merchants.",

  applicationName: "Hisaab Sathi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}