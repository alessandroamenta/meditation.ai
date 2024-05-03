"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarNavItem } from "types";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";

import { useFeedbackModal } from "@/hooks/use-feedback-modal";
import { FeedbackModal } from "./feedback-modal";

import { Button } from "@/components/ui/button";
import { CREDITS_UPDATED_EVENT } from "@/lib/events";

interface DashboardNavProps {
  items: SidebarNavItem[];
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname();
  const [credits, setCredits] = useState(0);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/get-user-credits");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCredits(data.credits);
        setSubscriptionPlan(data.subscriptionPlan);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const handleCreditsUpdated = () => {
      fetchUserData();
    };

    fetchUserData();

    window.addEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdated);

    return () => {
      window.removeEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdated);
    };
  }, []);

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
                    item.disabled && "cursor-not-allowed opacity-80",
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

      <div className="mt-4">
        <Link href="/dashboard/billing">
          <Button
            className={cn(
              "group flex items-center rounded-md px-4 py-3 text-base font-medium text-white",
              credits === 0 && subscriptionPlan === "Free Trial"
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
            )}
          >
            <Icons.topup className="mr-2 size-4 text-white" />
            {credits === 0 && subscriptionPlan === "Free Trial" ? (
              <span className="whitespace-nowrap">
                {" "}
                <span className="font-bold">0</span> credits left. Upgrade!
              </span>
            ) : (
              <span className="whitespace-nowrap">
                You have <span className="font-bold">{credits}</span> credits
              </span>
            )}
          </Button>
        </Link>
      </div>

      <div className="mt-auto">
        <Button
          onClick={() => useFeedbackModal.getState().onOpen()}
          className="left-30 group fixed bottom-28 flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          style={{
            zIndex: 9999,
          }}
        >
          <Icons.feedback className="mr-2 size-4" />
          <span>Feedback + ideas</span>
        </Button>
      </div>

      <FeedbackModal />
    </div>
  );
}
