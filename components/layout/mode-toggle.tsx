"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative flex h-7 w-14 items-center justify-center rounded-full bg-gray-200 transition-colors duration-200 dark:bg-gray-700"
    >
      <div className="absolute left-0.5 top-0.5 h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:translate-x-7">
        {theme === "dark" ? (
          <Icons.moon className="absolute left-0.5 top-0.5 h-5 w-5 text-gray-700" />
        ) : (
          <Icons.sun className="absolute left-0.5 top-0.5 h-5 w-5 text-yellow-500" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
