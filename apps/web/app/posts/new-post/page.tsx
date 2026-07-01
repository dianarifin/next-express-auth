import { CreatePostCard } from "@/components/posts/create-post-card";
import { RequireAuth } from "@/components/auth/require-auth";

export default function NewPostPage() {
  return (
    <RequireAuth>
      <div className="flex min-h-screen items-center justify-center">
        <CreatePostCard />
      </div>
    </RequireAuth>
  );
}
