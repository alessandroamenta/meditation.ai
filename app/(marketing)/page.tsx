import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn, nFormatter } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import { env } from "@/env.mjs";
import Image from "next/image";

export default async function IndexPage() {
  return (
    <>
      <section className="space-y-6 pb-12 pt-16 lg:py-28">
        <div className="container flex max-w-[64rem] flex-col items-center gap-5 text-center">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "xl" }),
              "animate-fade-up opacity-0",
            )}
            style={{
              animationDelay: "0.15s",
              animationFillMode: "forwards",
              fontSize: "1.25rem",
            }}
          >
            Start now!
          </Link>

          <h1
            className="animate-fade-up text-balance font-urban text-4xl font-extrabold tracking-tight opacity-0 sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
          >
            Unlock your inner peace with{" "}
            <span className="bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text font-extrabold text-transparent">
              Dora.AI
            </span>
          </h1>

          <p
            className="max-w-[42rem] animate-fade-up text-balance leading-normal text-muted-foreground opacity-0 sm:text-xl sm:leading-8"
            style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}
          >
            Achieve mental clarity and relaxation with AI-generated guided
            meditations for any mind, any mood, any goal.
          </p>

          <div
            className="animate-fade-up opacity-0"
            style={{
              animationDelay: "0.4s",
              animationFillMode: "forwards",
              backgroundColor: "white", // Fully white background
              borderRadius: "8px", // Optional: if you want rounded corners
              display: "inline-block", // Ensures the div wraps tightly around the image
              padding: "10px", // Optional: adds some space between the image and the background edge
            }}
          >
            <Image
              src="https://illustrations.popsy.co/sky/meditation-girl.svg"
              alt="Meditation Girl Illustration"
              width={300}
              height={300}
              priority
            />
          </div>

          <div
            className="flex animate-fade-up justify-center space-x-2 opacity-0 md:space-x-4"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }))}
            >Try it</Link>
          </div>
        </div>
      </section>

      <section
        className="animate-fade-up py-16 text-zinc-500 opacity-0 dark:text-zinc-400"
        style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}
      >
        <div className="container mx-auto">
          <h2 className="text-center text-sm font-semibold uppercase">
            AI generated meditations.
            <br />
            Powered by
          </h2>
          <div className="my-7 flex flex-wrap items-center justify-center gap-10 gap-y-8 lg:gap-14">
            {features.map((feature) => (
              <Link
                target="_blank"
                key={feature.title}
                href={feature.href}
                aria-label={feature.title}
                className="flex flex-col items-center transition duration-300 hover:text-black dark:hover:text-white"
              >
                {feature.icon}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const features = [
  {
    title: "OpenAI",
    href: "https://openai.com/",
    icon: (
      <svg
        className="h-8 w-auto"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
      >
        <path
          fill="currentColor"
          d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
          fillRule="evenodd"
        ></path>
      </svg>
    ),
  },
  {
    title: "Anthropic",
    href: "https://www.anthropic.com/",
    icon: (
      <svg
        className="h-10 w-auto"
        viewBox="0 0 46 32"
        xmlns="http://www.w3.org/2000/svg"
        width="46"
        height="32"
      >
        <path
          fill="currentColor"
          d="M32.73 0h-6.945L38.45 32h6.945L32.73 0ZM12.665 0 0 32h7.082l2.59-6.72h13.25l2.59 6.72h7.082L19.929 0h-7.264Zm-.702 19.337 4.334-11.246 4.334 11.246h-8.668Z"
          fillRule="evenodd"
        ></path>
      </svg>
    ),
  },
  {
    title: "ElevenLabs",
    href: "https://elevenlabs.io/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        className="size-10"
      >
        <rect width="256" height="256" fill="none"></rect>
        <line
          x1="128"
          y1="32"
          x2="128"
          y2="224"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="20"
        ></line>
        <line
          x1="192"
          y1="32"
          x2="192"
          y2="224"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="20"
        ></line>
      </svg>
    ),
  },
];
