import { authenticateJwt } from "@/middleware/authenticate-jwt";
import { Router } from "express";
import {
  createPostController,
  getPostController,
  listMyPostsController,
  updatePostController,
} from "./posts.controller";

const router = Router();

// semua routes posts butuh autentikasi
router.use(authenticateJwt);

router.post("/", createPostController);
router.get("/", listMyPostsController);
router.get("/:id", getPostController);
router.put("/:id", updatePostController);

export default router;
