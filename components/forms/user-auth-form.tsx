"use client";
import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Icons } from "@/components/shared/icons";
import { createClient } from "@supabase/supabase-js";
import { randomString } from '@/lib/utils';
import { env } from "@/env.mjs";



interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
}

type FormData = z.infer<typeof userAuthSchema>;

export function UserAuthForm({ className, type, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [showCodeInput, setShowCodeInput] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");

  const searchParams = useSearchParams();
  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ""
  );
  async function onSubmit(data: FormData) {
    setIsLoading(true);

    if (!showCodeInput) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email.toLowerCase(),
          options: {
            shouldCreateUser: true,
          },
        });

        setIsLoading(false);

        if (error) {
          return toast({
            title: "Something went wrong.",
            description: error.message,
            variant: "destructive",
          });
        }

        setEmail(data.email.toLowerCase());
        setShowCodeInput(true);

        return toast({
          title: "Check your email",
          description: "We sent you a magic link. Please click on it to sign in.",
        });
      } catch (error) {
        setIsLoading(false);
        return toast({
          title: "Something went wrong.",
          description: "An error occurred while sending the magic link.",
          variant: "destructive",
        });
      }
    } else {
      try {
        console.log("Verifying OTP:", email, data.code);
        const {
          data: { session },
          error,
        } = await supabase.auth.verifyOtp({
          email,
          token: data.code ?? "",
          type: "email",
        });
      
        setIsLoading(false);
      
        if (error) {
          return toast({
            title: "Something went wrong.",
            description: error.message,
            variant: "destructive",
          });
        }
      
        // Sign in the user using the `signIn` function
        const result = await signIn("credentials", {
          redirect: false,
          email,
          callbackUrl: "/dashboard",
        });
        console.log("Sign-in result:", result);
      
        if (result?.error) {
          return toast({
            title: "Something went wrong.",
            description: result.error,
            variant: "destructive",
          });
        }
      
        // Redirect to the dashboard after successful login
        router.push("/dashboard");
      } catch (error) {
        setIsLoading(false);
        return toast({
          title: "Something went wrong.",
          description: "An error occurred while verifying the magic link.",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          {showCodeInput && (
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="code">
                Verification Code
              </Label>
              <Input
                id="code"
                placeholder="Enter verification code"
                type="text"
                autoCapitalize="none"
                autoComplete="one-time-code"
                autoCorrect="off"
                disabled={isLoading || isGoogleLoading}
                {...register("code")}
              />
              {errors?.code && (
                <p className="px-1 text-xs text-red-600">
                  {errors.code.message}
                </p>
              )}
            </div>
          )}
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            {showCodeInput ? "Verify Code" : "Sign In with Email"}
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={() => {
          setIsGoogleLoading(true);
          signIn("google");
        }}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 size-4" />
        )}{" "}
        Google
      </button>
    </div>
  );
}