import { createRouter } from "../context";
import { z } from "zod";

export const eventTypeRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.eventType.findMany({
        orderBy: { name: "asc" },
      });
    },
  })
  .query("getById", {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.eventType.findUniqueOrThrow({
        where: { id: input.id },
      });
    },
  })
  .mutation("save", {
    input: z.object({
      id: z.number().optional(),
      name: z.string(),
      description: z.string(),
      iconName: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.eventType.upsert({
        where: {
          id: input.id ?? -1,
        },
        create: input,
        update: input,
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.eventType.delete({
        where: { id: input.id },
      });
    },
  });
