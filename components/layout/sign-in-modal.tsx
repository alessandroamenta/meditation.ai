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
            disabled={signInClicked}
            onClick={() => {
              setSignInClicked(true);
              signIn("google", { redirect: true, callbackUrl: "/dashboard" }) // Redirect to /dashboard after sign-in
                .then(() =>                // TODO: fix this without setTimeOut(), modal closes too quickly. Idea: update value before redirect
                setTimeout(() => {
                  signInModal.onClose();
                }, 1000)
              );
            }}
          >
            {signInClicked ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 size-4" />
            )}{" "}
            Sign In with Google
          </Button>
        </div>
      </div>
    </Modal>
  );
};