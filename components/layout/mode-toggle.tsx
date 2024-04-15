"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/shared/icons"
import { useEffect, useState } from "react";


export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(theme || 'default');

  useEffect(() => {
    setLocalTheme(theme || 'default');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = localTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setLocalTheme(newTheme);
  };

  const icon = localTheme === 'dark' ? <Icons.sun /> : <Icons.moon />;

  return (
    <Button onClick={toggleTheme}>
      {icon}
      <span className="sr-only">Switch to {localTheme === 'dark' ? 'light' : 'dark'} mode</span>
    </Button>
  );
}
