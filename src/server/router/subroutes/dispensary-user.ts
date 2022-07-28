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
      return await ctx.prisma.dispensary.findMany({
        select: {
          id: true,
          name: true,
          locations: { select: { id: true, name: true } },
        },
      });
    },
  })
  .mutation("saveLocation", {
    input: z.object({
      location: z.object({
        id: z.string().optional(),
        dispensaryId: z.string().optional(),
        name: z.string(),
        address: z.string(),
      }),
      dispensary: z
        .object({
          name: z.string(),
        })
        .optional(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.dispensaryLocation.upsert({
        where: {
          id: input.location.id,
        },
        create: {
          name: input.location.name,
          address: input.location.address,
          dispensary: {
            connectOrCreate: {
              where: {
                id: input.location.dispensaryId,
              },
              create: {
                name: input.dispensary?.name ?? "NO NAME",
              },
            },
          },
        },
        update: {
          name: input.location.name,
          address: input.location.address,
        },
      });
    },
  })
  .query("getUsers", {
    input: z.object({
      dispensaryId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.dispensaryUser.findMany({
        select: { id: true, user: { select: { name: true, email: true } } },
        where: { id: { equals: input.dispensaryId } },
      });
    },
  })
  .mutation("saveUser", {
    input: z.object({
      id: z.string().optional(),
      name: z.string(),
      email: z.string().email(),
      dispensaryId: z.string(),
      locationIds: z.array(z.string()),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.dispensaryUser.upsert({
        where: {
          id: input.id,
        },
        create: {
          dispensary: {
            connect: {
              id: input.dispensaryId,
            },
          },
          user: {
            connectOrCreate: {
              where: { email: input.email },
              create: {
                name: input.name,
                email: input.email,
                role: Role.DISPENSARY,
              },
            },
          },
        },
        update: {
          user: {
            update: {
              name: input.name,
              email: input.email,
            },
          },
        },
      });
    },
  })
  .mutation("deleteUser", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const dispensaryUser = await ctx.prisma.dispensaryUser.findUnique({
        where: { id: input.id },
      });
      if (dispensaryUser) {
        return await ctx.prisma.user.delete({
          where: { id: dispensaryUser.userId },
        });
      }
    },
  });
