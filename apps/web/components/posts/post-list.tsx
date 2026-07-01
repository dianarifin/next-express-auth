"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PostPublic } from "@repo/database/types/types";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

async function fetchPosts(): Promise<PostPublic[]> {
  const res = await apiFetch("/posts", { method: "GET" });
  const data = (await res.json()) as { posts: PostPublic[] };

  return data.posts;
}

export function PostList() {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 5, // 5 minutes // agar tidak re-fetch meski cache secara defaultnya 5 menit
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading posts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-destructive">
        Failed to load posts
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FileText className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground">No posts yet</p>
        <Link
          href="/posts/new-post"
          className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
        >
          <Plus className="size-4" />
          Create your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">My Posts</h1>
        <Link
          href="/posts/new-post"
          className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
        >
          <Plus className="size-4" />
          New Post
        </Link>
      </div>

      {posts.map((post) => (
        <Link key={post.id} href={`/posts/${post.id}`}>
          <div className="bg-neutral-800 border border-neutral-700/50 p-4 space-y-2 hover:bg-neutral-750 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-medium leading-snug">
                {post.title}
              </h2>
              <Badge variant={post.published ? "accent" : "muted"}>
                {post.published ? "Published" : "Draft"}
              </Badge>
            </div>

            {post.content && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {post.content}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
