"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarNavItem } from "types";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

import { useFeedbackModal } from "@/hooks/use-feedback-modal";
import { FeedbackModal } from "./feedback-modal";

import { Button } from "@/components/ui/button"

interface DashboardNavProps {
  items: SidebarNavItem[];
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <div>
      <nav className="grid items-start gap-2">
        {items.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          return (
            item.href && (
              <Link key={index} href={item.disabled ? "/" : item.href}>
                <span
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    path === item.href ? "bg-accent" : "transparent",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  <Icon className="mr-2 size-4" />
                  <span>{item.title}</span>
                </span>
              </Link>
            )
          );
        })}
      </nav>

      <div className="mt-auto">
        <Button
          onClick={() => useFeedbackModal.getState().onOpen()}
          className="group fixed bottom-28 left-30 flex items-center rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600"
          style={{
            zIndex: 9999, // Ensure the button is on top of other elements
          }}
        >
          <Icons.feedback className="mr-2 size-4" />
          <span>Feedback</span>
        </Button>
      </div>

      <FeedbackModal />
    </div>
  );
}
