import { createRouter } from "../context";
import { z } from "zod";

export const eventAdminRouter = createRouter()
  .query("getEventTypes", {
    async resolve({ ctx }) {
      return await ctx.prisma.eventType.findMany({ orderBy: { name: "asc" } });
    },
  })
  .query("getDurations", {
    async resolve({ ctx }) {
      return await ctx.prisma.duration.findMany({
        orderBy: { duration: "asc" },
      });
    },
  })
  .mutation("createEventType", {
    input: z.object({
      name: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.eventType.create({
        data: {
          name: input.name,
        },
      });
    },
  })
  .mutation("deleteEventType", {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.eventType.delete({
        where: { id: input.id },
      });
    },
  });
