import { createRouter } from "../context";
import { z } from "zod";
import {
  AmbassadorZod,
  calculateFreeHours,
  NULL_AMBASSADOR,
  scheduleFormValuesToDatabaseModels,
  schedulesToSparseArray,
} from "../../lib/ambassador";

export const ambassadorRouter = createRouter()
  .query("getById", {
    input: z.object({
      id: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      const amb = await ctx.prisma.ambassador.findUnique({
        where: { id: input.id ?? "UNDEFINED" },
        include: {
          schedules: true,
        },
      });

      if (!amb) {
        return NULL_AMBASSADOR;
      }

      return {
        ...amb,
        schedules: schedulesToSparseArray(amb.schedules),
      };
    },
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.ambassador.findMany({ orderBy: { name: "asc" } });
    },
  })
  .query("getAvailability", {
    input: z.object({
      month: z.date(),
    }),
    async resolve({ ctx, input }) {
      const ambassadors = await ctx.prisma.ambassador.findMany({
        select: { schedules: true, exceptions: true, scheduledEvents: true },
      });
      return calculateFreeHours(input.month, ambassadors);
    },
  })
  .mutation("delete", {
    input: z.object({ id: z.string() }),
    async resolve({ ctx, input }) {
      await ctx.prisma.ambassador.delete({ where: { id: input.id } });
      return input.id;
    },
  })
  .mutation("save", {
    input: AmbassadorZod,
    async resolve({ ctx, input }) {
      const schedules = scheduleFormValuesToDatabaseModels(input.schedules);

      return await ctx.prisma.ambassador.upsert({
        where: {
          id: input.id ?? "UNDEFINED",
        },
        create: {
          name: input.name,
          email: input.email,
          schedules: {
            create: schedules,
          },
        },
        update: {
          name: input.name,
          email: input.email,
          schedules: {
            deleteMany: {},
            create: schedules,
          },
        },
      });
    },
  });
