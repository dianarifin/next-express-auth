"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import { apiFetch } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import type { PostWithAuthor } from "@repo/database/types/types";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
  published: z.boolean(),
});

type FormSchemaType = z.infer<typeof formSchema>;

async function fetchPost(id: string): Promise<PostWithAuthor> {
  const res = await apiFetch(`/posts/${id}`, { method: "GET" });

  if (res.status === 404) {
    throw new Error("Post not found");
  }

  const data = (await res.json()) as { post: PostWithAuthor };
  return data.post;
}

export function EditPostCard({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading: loadingPost,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
  });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    values: {
      title: post?.title ?? "",
      content: post?.content ?? "",
      published: post?.published ?? false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormSchemaType) => {},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push(`/posts/${id}`);
    },
    onError: (error: Error) => {
      form.setError("root", { message: error.message });
    },
  });

  const onSubmit = (data: FormSchemaType) => {
    mutation.mutate(data);
  };

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading post...
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Button
        variant="ghost"
        className="w-fit -ml-2"
        onClick={() => router.push(`/posts/${id}`)}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="w-full h-auto bg-neutral-800 border border-neutral-700/50 p-5">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Post</CardTitle>
          <CardDescription>Update your post</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form
            id="edit-post-form"
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
                  <Field
                    orientation="horizontal"
                    className="items-center gap-3"
                  >
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
              form="edit-post-form"
              className="w-full"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardFooter>
      </div>
    </div>
  );
}
