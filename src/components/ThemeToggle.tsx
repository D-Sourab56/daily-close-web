"use client";

import {
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY =
  "hisaab-sathi-theme";

function getAppliedTheme(): Theme {
  if (
    document.documentElement.dataset
      .theme === "dark"
  ) {
    return "dark";
  }

  return "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] =
    useState<Theme>("light");

  useEffect(() => {
    const frameId =
      window.requestAnimationFrame(
        () => {
          setTheme(
            getAppliedTheme(),
          );
        },
      );

    return () => {
      window.cancelAnimationFrame(
        frameId,
      );
    };
  }, []);

  function changeTheme() {
    const nextTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    document.documentElement.dataset.theme =
      nextTheme;

    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme,
    );

    setTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <button
      className="themeToggle"
      type="button"
      aria-pressed={isDark}
      onClick={changeTheme}
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      <span
        className="themeIcon"
        aria-hidden="true"
      >
        {isDark ? "☀" : "☾"}
      </span>

      <span className="themeText">
        <strong>
          {isDark
            ? "Light"
            : "Dark"}
        </strong>

        <small>
          {isDark
            ? "उज्यालो"
            : "राति"}
        </small>
      </span>
    </button>
  );
}