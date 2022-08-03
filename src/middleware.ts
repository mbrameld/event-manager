import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { withAuth } from "next-auth/middleware"; // This makes all matched routes require an authed user

const adminRouteAllowedRoles = new Set<Role | undefined>([
  Role.ADMIN,
  Role.AMBASSADOR,
  Role.EXECUTIVE,
]);

const rolesAllowedToAuth = new Set<Role>([
  Role.ADMIN,
  Role.AMBASSADOR,
  Role.DISPENSARY,
  Role.EXECUTIVE,
]);

const rolesToRoutes = new Map<Role | undefined, string>([
  [Role.ADMIN, "/admin"],
  [Role.EXECUTIVE, "/admin"],
  [Role.DISPENSARY, "/schedule"],
  [Role.AMBASSADOR, "/admin"],
]);

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
/*
    All pages require an authenticated user.

    If a user's role is unassigned, redirect them to a page where they can request access (for now just reject)
    To implement, add unassigned to rolesAllowedToAuth and add check for role in middleware

    The admin route requires one of the admin-like roles for now, redirect if they don't have it
*/
export default withAuth(
  function middleware(req) {
    // If they're requesting the root, rewrite based on role
    const redirectTo = rolesToRoutes.get(req.nextauth.token?.role) ?? "/404";
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    // If they're trying to access admin without a good role send them to the schedule
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      !adminRouteAllowedRoles.has(req.nextauth.token?.role)
    ) {
      return NextResponse.redirect(new URL("/schedule", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) =>
        token?.role !== undefined && rolesAllowedToAuth.has(token.role),
    },
  }
);

export const config = { matcher: ["/", "/admin/:path*", "/schedule/:path*"] };
