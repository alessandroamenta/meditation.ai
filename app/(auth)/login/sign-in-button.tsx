// app/login/sign-in-button.tsx
"use client";

import { Button } from "@/components/ui/button";

export const SignInButton = () => {
  const handleSignIn = () => {
    document.dispatchEvent(new CustomEvent("openSignInModal"));
  };

  return (
    <Button
      className="hover:text-brand underline underline-offset-4"
      variant="link"
      onClick={handleSignIn}
    >
      Already have an account? Sign In
    </Button>
  );
};
