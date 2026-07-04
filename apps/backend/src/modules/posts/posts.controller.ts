import type { PostPublic, PostWithAuthor } from "@repo/database/types/types";
import { NextFunction, Request, Response } from "express";
import {
  createPost,
  deletePost,
  getPostsById,
  getPostsByUser,
  updatePost,
} from "./posts.service";

// create post
export async function createPostController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, content, published } = req.body;
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const post = await createPost({
      title: title.trim(),
      content: content?.trim(),
      published,
      authorId: req.user!.id,
    });

    res.status(201).json({ post: post as PostWithAuthor });
  } catch (error) {
    next(error);
  }
}

// list post milik user yang login
export async function listMyPostsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const posts = await getPostsByUser(req.user!.id);
    res.json({ posts: posts as PostPublic[] });
  } catch (error) {
    next(error);
  }
}

// get single post by id
export async function getPostController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    const post = await getPostsById(id);

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json({ post: post as PostWithAuthor });
  } catch (error) {
    next(error);
  }
}

// update post by id
export async function updatePostController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;
    const { title, content, published } = req.body;

    const existing = await getPostsById(id);
    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (existing.authorId !== req.user!.id) {
      res
        .status(403)
        .json({ error: "You are not authorized to update this post" });
      return;
    }

    const post = await updatePost(id, {
      title: title?.trim(),
      content: content?.trim(),
      published,
    });
    res.json({ post: post as PostWithAuthor });
  } catch (error) {
    next(error);
  }
}

// delete post by id
export async function deletePostController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = req.params.id as string;

    const existing = await getPostsById(id);
    if (!existing) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (existing.authorId !== req.user!.id) {
      res
        .status(404)
        .json({ error: "You are not authorized to delete this post" });
      return;
    }

    await deletePost(id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
}
