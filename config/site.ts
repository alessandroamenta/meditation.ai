import { env } from "@/env.mjs";
import { SiteConfig } from "types";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "🧘‍♀️Dora.AI",
  description: "Get some headspace using the power of AI.",
  url: site_url,
  ogImage: `${site_url}/og.jpg`,
  links: {
    twitter: "https://twitter.com/ale_amenta",
    github: "https://github.com/alessandroamenta",
  },
  mailSupport: "alessandroamenta1@gmail.com",
};
