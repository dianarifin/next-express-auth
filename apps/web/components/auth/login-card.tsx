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
import { Field, FieldGroup, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import Link from "next/link";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/auth/google"

export function LoginCard() {
  const [isPending, startTransition] = useTransition();

  const formSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  });

  type formSchemaType = z.infer<typeof formSchema>

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = (data: formSchemaType) => {
    console.log(data)

  }
  return (
    <div className="w-150 h-auto bg-neutral-800 border border-neutral-700/50  p-5">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to login</CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        <form id="login-form" onSubmit={form.handleSubmit(handleLogin)} >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="border-none" >
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}

                      {...field}
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
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                      {...field}
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
        <div className="flex flex-col w-full gap-2" >

          <Button type="submit" form="login-form" className="w-full">
            Masuk
        </Button>
        <Button className="bg-blue-400" >
            <Link href={BACKEND_URL}>
              Sign In With Google
          </Link>
          </Button>
        </div>
        </CardFooter>

    </div>
  );
}
