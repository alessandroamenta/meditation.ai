"use client";

import * as React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { MainNavItem } from "types";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/layout/mobile-nav";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
}

export function MainNav({ items, children }: MainNavProps) {
  const segment = useSelectedLayoutSegment();
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  React.useEffect(() => {
    const closeMobileMenuOnClickOutside = (event: MouseEvent) => {
      if (showMobileMenu) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("click", closeMobileMenuOnClickOutside);

    return () => {
      document.removeEventListener("click", closeMobileMenuOnClickOutside);
    };
  }, [showMobileMenu]);

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/dashboard" className="hidden items-center space-x-2 md:flex">
        <span className="font-urban text-xl font-bold">{siteConfig.name}</span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                item.href.startsWith(`/${segment}`)
                  ? "text-foreground"
                  : "text-foreground/60",
                item.disabled && "cursor-not-allowed opacity-80",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <button
        className="md:hidden"
        onClick={toggleMobileMenu}
      >
        <span className="font-bold">{siteConfig.name}</span>
      </button>
      {showMobileMenu && items && (
        <MobileNav items={items}>{children}</MobileNav>
      )}
    </div>
  );
}