"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const GOOGLE_AUTH_URL = `${BACKEND_URL}/auth/google`;

export function LoginCard() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const formSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  });

  type formSchemaType = z.infer<typeof formSchema>;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: formSchemaType) => {
    startTransition(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        const result = await res.json();

        if (!res.ok) {
          if (res.status === 429) {
            // rate limit error - tampilkan sebagai global banner
            setErrorMessage(result.error || "Terlalu banyak percobaan. Silakan coba lagi nanti!")
          }

          form.setError("email", { message: result.error || "Login failed" });
          return;
        }

        // Simpan token di localStorage (sama seperti Google login)
        localStorage.setItem("token", result.token);

        // redirect ke dashboard
        router.push("/dashboard");
      } catch (err) {
        form.setError("email", { message: "network error, please try again" });
      }
    });
  };
  return (
    <div className="w-150 h-auto bg-neutral-800 border border-neutral-700/50  p-5">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to login</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form id="login-form" onSubmit={form.handleSubmit(handleLogin)}>
          <FieldGroup>
            {errorMessage && (
              <div
                role="alert"
                className="rounded-none border border-red-500/50 bg-red-950/50 px-4 text-sm text-red-400"
              >
                {errorMessage}
              </div>
            )}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="border-none"
                >
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        setErrorMessage(null);
                        field.onChange(e);
                      }}
                      onFocus={() => setErrorMessage(null)}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => {
                        setErrorMessage(null);
                        field.onChange(e);
                      }}
                      onFocus={() => setErrorMessage(null)}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="mt-5 border-none">
        <div className="flex flex-col w-full gap-2">
          <Button
            disabled={isPending}
            type="submit"
            form="login-form"
            className="w-full"
          >
            Masuk
          </Button>
          <Button className="bg-blue-400" disabled={isPending}>
            <Link href={GOOGLE_AUTH_URL}>Sign In With Google</Link>
          </Button>
        </div>
      </CardFooter>
    </div>
  );
}
