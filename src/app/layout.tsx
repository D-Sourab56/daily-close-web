import type {
  Metadata,
} from "next";

import ThemeToggle from "@/components/ThemeToggle";

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

const themeScript = `
  (function () {
    try {
      var savedTheme =
        window.localStorage.getItem(
          "hisaab-sathi-theme"
        );

      var prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      var selectedTheme =
        savedTheme === "dark" ||
        savedTheme === "light"
          ? savedTheme
          : prefersDark
            ? "dark"
            : "light";

      document.documentElement.dataset.theme =
        selectedTheme;
    } catch (error) {
      document.documentElement.dataset.theme =
        "light";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body>
        <ThemeToggle />

        {children}
      </body>
    </html>
  );
}