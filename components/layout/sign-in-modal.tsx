"use client";

import { useState, useEffect } from "react";

import { Icons } from "@/components/shared/icons";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useSigninModal } from "@/hooks/use-signin-modal";
import { signIn } from "next-auth/react";

export const SignInModal = () => {
  const signInModal = useSigninModal();
  const [signInClicked, setSignInClicked] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenSignInModal = () => {
      signInModal.onOpen();
    };

    document.addEventListener("openSignInModal", handleOpenSignInModal);

    return () => {
      document.removeEventListener("openSignInModal", handleOpenSignInModal);
    };
  }, [signInModal]);

  return (
    <Modal showModal={signInModal.isOpen} setShowModal={signInModal.onClose}>
      <div className="w-full">
        <div className="flex flex-col items-center justify-center space-y-3 border-b bg-background px-4 py-6 pt-8 text-center md:px-16">
          <a href={siteConfig.url} className="text-6xl">
            🧘‍♀️
          </a>
          <h3 className="font-urban text-2xl font-bold">Sign In</h3>
        </div>

        <div className="flex flex-col space-y-4 bg-secondary/50 px-4 py-8 md:px-16">
          <Button
            variant="default"
            disabled={signInClicked && selectedProvider !== "google"}
            onClick={() => {
              setSignInClicked(true);
              setSelectedProvider("google");
              signIn("google", {
                redirect: true,
                callbackUrl: "/dashboard",
              }).then(() =>
                setTimeout(() => {
                  signInModal.onClose();
                }, 1000),
              );
            }}
          >
            {signInClicked && selectedProvider === "google" ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-4" />
            )}{" "}
            Sign In with Google
          </Button>
          <Button
            variant="default"
            disabled={signInClicked && selectedProvider !== "twitter"}
            onClick={() => {
              setSignInClicked(true);
              setSelectedProvider("twitter");
              signIn("twitter", {
                redirect: true,
                callbackUrl: "/dashboard",
              }).then(() =>
                setTimeout(() => {
                  signInModal.onClose();
                }, 1000),
              );
            }}
          >
            {signInClicked && selectedProvider === "twitter" ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.twitter className="mr-2 size-4" />
            )}{" "}
            Sign In with Twitter
          </Button>
        </div>
      </div>
    </Modal>
  );
};
