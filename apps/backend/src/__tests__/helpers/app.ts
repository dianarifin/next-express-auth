import passport from "@/config/passport";
import { errorHandler } from "@/middleware/error-handler";
import authRoutes from "@/modules/auth/auth.routes";
import postRoutes from "@/modules/posts/posts.routes";
import express from "express";

export function createTestApp() {
  const app = express();

  app.use(express.json());
  app.use(passport.initialize());

  // routes
  app.use("/auth", authRoutes);
  app.use("/posts", postRoutes);

  // health check
  app.get("/", (_req, res) => {
    res.json({ message: "Hello from backend!" });
  })

  // Error handler - harus paling akhir
  app.use(errorHandler);

  return app;
}
