import { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { UserAuthForm } from "@/components/forms/user-auth-form";
import { Suspense } from "react";
import DoraLogo from "@/components/ui/dora-logo";
import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/layout/sign-in-modal";
import { SignInButton } from "./sign-in-button";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "absolute left-4 top-4 md:left-8 md:top-8",
        )}
      >
        <>
          <Icons.chevronLeft className="mr-2 size-4" />
          Back
        </>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-6">
            <DoraLogo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign up!</h1>
          <p className="text-sm text-muted-foreground">
            Use your Google or X account to get started
          </p>
        </div>
        <Suspense>
          <UserAuthForm />
        </Suspense>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <SignInButton />
        </p>
      </div>
      <SignInModal />
    </div>
  );
}
