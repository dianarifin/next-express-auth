import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  minify: true,
  noExternal: ["@repo/database"],
  external: ["dotenv", "@prisma/client", "@prisma/adapter-pg", "pg"],
});
