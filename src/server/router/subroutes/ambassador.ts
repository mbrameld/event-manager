import { createRouter } from "../context";
import { z } from "zod";
import {
  AmbassadorZod,
  calculateFreeHours,
  NULL_AMBASSADOR,
  scheduleFormValuesToDatabaseModels,
  schedulesToSparseArray,
} from "../../lib/ambassador";
import { Role } from "@prisma/client";

export const ambassadorRouter = createRouter()
  .query("getById", {
    input: z.object({
      id: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      const amb = await ctx.prisma.ambassador.findUnique({
        where: { id: input.id ?? "UNDEFINED" },
        select: {
          id: true,
          schedules: true,
          user: { select: { email: true, name: true } },
        },
      });

      if (!amb) {
        return NULL_AMBASSADOR;
      }

      return {
        id: amb.id,
        name: amb.user.name ?? "",
        email: amb.user.email ?? "",
        schedules: schedulesToSparseArray(amb.schedules),
      };
    },
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return (
        await ctx.prisma.ambassador.findMany({
          select: { id: true, user: { select: { name: true, email: true } } },
          orderBy: { user: { name: "asc" } },
        })
      ).map((amb) => {
        return { id: amb.id, name: amb.user.name, email: amb.user.email };
      });
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
          user: {
            connectOrCreate: {
              where: {
                email: input.email,
              },
              create: {
                name: input.name,
                email: input.email,
                role: Role.AMBASSADOR,
              },
            },
          },
          schedules: {
            create: schedules,
          },
        },
        update: {
          user: {
            update: {
              name: input.name,
              email: input.email,
            },
          },
          schedules: {
            deleteMany: {},
            create: schedules,
          },
        },
      });
    },
  });
