import { prisma } from "@repo/database/lib/prisma";

export async function createPost(data: {
  title: string;
  content?: string;
  published: boolean;
  authorId: string;
}) {
  {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        published: data.published ?? false,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return post;
  }
}

export async function getPostsByUser(userId: string) {
  return prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostsById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function updatePost(
  id: string,
  data: { title?: string; content?: string; published?: boolean },
) {
  const post = await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      published: data.published,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return post;
}
