import { authenticateJwt } from "@/middleware/authenticate-jwt";
import { Router } from "express";
import {
  createPostController,
  getPostController,
  listMyPostsController,
} from "./posts.controller";

const router = Router();

// semua routes posts butuh autentikasi
router.use(authenticateJwt);

router.post("/", createPostController);
router.get("/", listMyPostsController);
router.get("/:id", getPostController);

export default router;
