"use client";

import { useTheme } from "./theme-provider";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-button-secondary inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm cursor-pointer ${className}`}
      aria-label={`Chuyển sang chế độ ${theme === "dark" ? "sáng" : "tối"}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--primary-strong)]" />
      <span className="sm:hidden">
        {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
      </span>
      <span className="hidden sm:inline">
        {theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
      </span>
    </button>
  );
}
