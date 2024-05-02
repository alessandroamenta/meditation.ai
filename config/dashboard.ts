import { DashboardConfig } from "types";

export const dashboardConfig: DashboardConfig = {
  mainNav: [],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "home",
    },
    {
      title: "Meditations",
      href: "/dashboard/meditations",
      icon: "magic",
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: "billing",
    },
  ],
};
