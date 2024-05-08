import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["((?!^/settings/).*)"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};