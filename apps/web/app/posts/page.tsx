import { PostList } from "@/components/posts/post-list";
import { RequireAuth } from "@/components/auth/require-auth";

export default function PostsPage() {
  return (
    <RequireAuth>
      <div className="min-h-screen py-8">
        <PostList />
      </div>
    </RequireAuth>
  );
}
