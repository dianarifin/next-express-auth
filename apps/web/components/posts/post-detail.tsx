"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { PostWithAuthor } from "@repo/database/types/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { DeletePostDialog } from "./delete-post-dialog";

async function fetchPost(id: string): Promise<PostWithAuthor> {
  const res = await apiFetch(`/posts/${id}`, { method: "GET" });

  if (res.status === 404) {
    throw new Error("Post not found");
  }

  const data = (await res.json()) as { post: PostWithAuthor };
  return data.post;
}

export function PostDetail({ id }: { id: string }) {
  const router = useRouter();

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
    staleTime: 1000 * 60 * 5, // 5 minutess
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading post...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive">
          {error.message === "Post not found"
            ? "Post not found"
            : "Failed to load post"}
        </p>
        <Button variant="outline" onClick={() => router.push("/posts")}>
          Back to posts
        </Button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <Button
        variant="ghost"
        className="w-fit -ml-2"
        onClick={() => router.push("/posts")}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="bg-neutral-800 border border-neutral-700/50 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-medium leading-snug">{post.title}</h1>
          <Badge variant={post.published ? "accent" : "muted"}>
            {post.published ? "Published" : "Draft"}
          </Badge>
        </div>

        {post.content && (
          <div className="text-sm text-body leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-neutral-700/50">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>
              Created:{" "}
              {new Date(post.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {post.updatedAt !== post.createdAt && (
              <span>
                Updated:{" "}
                {new Date(post.updatedAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {post.author.avatarUrl && (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name ?? ""}
                className="size-6 rounded-full"
              />
            )}
            <span>{post.author.name ?? post.author.email}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 z-1000">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/posts/${id}/edit-post`)}
        >
          <Pencil className="size-4" />
          Edit Post
        </Button>
        <DeletePostDialog id={id} onSuccess={() => router.push("/posts")} />
      </div>
    </div>
  );
}
