import { createRouter } from "../context";
import { z } from "zod";
import { endOfDay, startOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

export const eventRouter = createRouter()
  .query("getAll", {
    input: z.object({
      ownerId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.scheduledEvent.findMany({
        include: { ambassador: { select: { name: true, email: true } } },
        where: { ownerId: input.ownerId },
        orderBy: { startTime: "asc" },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.scheduledEvent.delete({
        where: { id: input.id },
      });
    },
  })
  .mutation("create", {
    input: z.object({
      ownerId: z.string(),
      durationHours: z.number().min(1).max(24),
      eventType: z.string(),
      startTime: z.date(),
    }),
    async resolve({ ctx, input }) {
      const azStartTime = utcToZonedTime(input.startTime, "America/Phoenix");
      const ambassadors = await ctx.prisma.ambassador.findMany({
        select: {
          id: true,
          exceptions: true,
          schedules: { where: { dayOfWeek: azStartTime.getDay() } },
          scheduledEvents: {
            where: {
              startTime: {
                gte: startOfDay(azStartTime),
                lte: endOfDay(azStartTime),
              },
            },
          },
        },
      });

      const hoursNeeded: number[] = [];
      for (
        let h = azStartTime.getHours();
        h < azStartTime.getHours() + input.durationHours;
        h++
      ) {
        hoursNeeded.push(h);
      }

      let ambIdWithAvail: string | undefined = undefined;
      for (const ambassador of ambassadors.filter(
        (a) => a.schedules.length === 1 // Ignore ambassadors with no availability on this day of the week
      )) {
        const hoursAvailable = new Set<number>();
        for (
          let h = ambassador.schedules[0]!.startHour;
          h < ambassador.schedules[0]!.endHour;
          h++
        ) {
          hoursAvailable.add(h);
        }
        for (const exception of ambassador.exceptions) {
          for (
            let h = utcToZonedTime(
              exception.start,
              "America/Phoenix"
            ).getHours();
            h < utcToZonedTime(exception.end, "America/Phoenix").getHours();
            h++
          ) {
            //TODO: Handle exceptions that span multiple days
            hoursAvailable.delete(h);
          }
        }

        for (const event of ambassador.scheduledEvents) {
          for (
            let h = utcToZonedTime(
              event.startTime,
              "America/Phoenix"
            ).getHours();
            h <
            utcToZonedTime(event.startTime, "America/Phoenix").getHours() +
              event.durationHours;
            h++
          ) {
            hoursAvailable.delete(h);
          }
        }
        if (hoursNeeded.filter((h) => !hoursAvailable.has(h)).length === 0) {
          ambIdWithAvail = ambassador.id;
          break;
        }
      }
      if (!ambIdWithAvail) {
        throw new Error("All ambassadors are busy.");
      }

      return await ctx.prisma.scheduledEvent.create({
        data: {
          ownerId: input.ownerId,
          ambassadorId: ambIdWithAvail,
          eventType: input.eventType,
          startTime: input.startTime,
          durationHours: input.durationHours,
        },
      });
    },
  });
