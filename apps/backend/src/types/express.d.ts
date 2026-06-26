import { JwtPayload } from "@/utils/jwt";

// Augment Express Request so req.user is typed instead of any
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
