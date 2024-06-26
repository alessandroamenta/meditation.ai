import * as React from "react";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import { ModeToggle } from "@/components/layout/mode-toggle";
import DoraLogo from "../ui/dora-logo";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <p className="text-center md:text-left">
            Made by a solo indie maker. Follow me on{" "}
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              X
            </a>
            . The code is available on{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
          <Link href="/privacy" className="text-sm text-muted-foreground">
            Privacy
          </Link>
        </div>
        <ModeToggle />
      </div>
    </footer>
  );
}