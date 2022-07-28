import { Role } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createRouter } from "../context";
import { z } from "zod";

//TODO: Put this somewhere it can be shared
const adminRouteAllowedRoles = new Set<Role | undefined>([
  Role.ADMIN,
  Role.AMBASSADOR,
  Role.EXECUTIVE,
]);

export const dispensaryUserRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session || !adminRouteAllowedRoles.has(ctx.session.user?.role)) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.user.findMany({
        select: { id: true, name: true, email: true },
        where: { role: { equals: Role.DISPENSARY } },
      });
    },
  })
  .mutation("save", {
    input: z.object({
      id: z.string().optional(),
      name: z.string(),
      email: z.string().email(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.user.upsert({
        where: {
          id: input.id ?? "UNDEFINED",
        },
        create: { ...input, role: Role.DISPENSARY },
        update: input,
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.user.delete({
        where: { id: input.id },
      });
    },
  });
