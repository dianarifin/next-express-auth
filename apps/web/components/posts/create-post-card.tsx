"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "../ui/checkbox";
import { apiFetch } from "@/lib/api";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
  published: z.boolean().default(false),
});

type FormSchemaType = z.infer<typeof formSchema>;

export function CreatePostCard() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      published: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormSchemaType) => {
      const res = await apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          published: data.published,
        }),
      })

      const result = await res.json();
      return result.post;
    },
    onSuccess: () => {
      router.push("/posts");
    },
    onError: (error: Error) => {
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (data: FormSchemaType) => {
    mutation.mutate(data);
  };

  return (
    <div className="w-150 h-auto bg-neutral-800 border border-neutral-700/50 p-5">
      <CardHeader>
        <CardTitle className="text-2xl">Create Post</CardTitle>
        <CardDescription>Write something new</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          id="create-post-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="border-none"
                >
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <FieldContent>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Enter post title"
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
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="content">Content</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="content"
                      placeholder="Write your post content..."
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
              name="published"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" className="items-center gap-3">
                  <FieldLabel htmlFor="published">
                    Publish immediately
                  </FieldLabel>
                  <FieldContent>
                    <Checkbox
                      id="published"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FieldContent>
                </Field>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="mt-5 border-none">
        <div className="flex flex-col w-full gap-2">
          <Button
            disabled={mutation.isPending}
            type="submit"
            form="create-post-form"
            className="w-full"
          >
            {mutation.isPending ? "Creating..." : "Create Post"}
          </Button>
        </div>
      </CardFooter>
    </div>
  );
}
