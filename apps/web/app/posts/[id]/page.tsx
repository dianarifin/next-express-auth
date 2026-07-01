import { PostDetail } from "@/components/posts/post-detail";
import { RequireAuth } from "@/components/auth/require-auth";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireAuth>
      <div className="min-h-screen py-8">
        <PostDetail id={id} />
      </div>
    </RequireAuth>
  );
}
