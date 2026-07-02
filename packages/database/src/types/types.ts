import { Prisma } from "@repo/database/generated/prisma/client";
import { Role } from "@repo/database/generated/prisma/enums";

export type { Role };

export type UserPublic = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    avatarUrl: true;
    role: true;
    provider: true;
    emailVerified: true;
  };
}>;

export type JwtPayload = UserPublic & { tokenVersion: number };

// post
// post tanpa author
export type PostPublic = Prisma.PostGetPayload<{
  select: {
    id: true;
    title: true;
    content: true;
    published: true;
    authorId: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

// Post dengan author (untuk detail view)
export type PostWithAuthor = Prisma.PostGetPayload<{
  select: {
    id: true;
    title: true;
    content: true;
    published: true;
    authorId: true;
    createdAt: true;
    updatedAt: true;
    author: {
      select: {
        id: true;
        name: true;
        email: true;
        avatarUrl: true;
      };
    };
  };
}>;

// shape untuk request body create post
export interface CreatePostInput {
  title: string;
  content?: string;
  published?: boolean;
}
