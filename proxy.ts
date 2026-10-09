import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/properties(.*)",
  "/api/webhooks(.*)",
  "/login(.*)",
  "/register(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // Protect all non-public routes and redirect unauthenticated users to sign-in
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|webp|png|jpg|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and TRPC routes
    "/(api|trpc)(.*)",
  ],
};