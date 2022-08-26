import { createRouter } from "../context";
import { z } from "zod";
import { endOfDay, startOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Prisma, PrismaClient } from "@prisma/client";

export const eventRouter = createRouter()
  .query("getAll", {
    input: z.object({
      ownerId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.scheduledEvent.findMany({
        include: {
          ambassador: {
            select: { user: { select: { name: true, email: true } } },
          },
          eventType: { select: { name: true, iconName: true } },
        },
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
      eventTypeId: z.number(),
      startTime: z.date(),
    }),
    async resolve({ ctx, input }) {
      const azStartTime = utcToZonedTime(input.startTime, "America/Phoenix");
      // Select all ambassadors who have availability on the day of the week of the new event
      // Include only that day's schedule along with any other events the ambassador has scheduled
      //    on the same day.
      const ambassadors = await getAmbassadors(ctx.prisma, azStartTime);

      // Calculate the hours of the day the event will cover
      const hoursNeeded = calculateHoursNeededForEvent(
        azStartTime,
        input.durationHours
      );

      // Look for an ambassador with availability for the event
      const availableAmbassador = findAvailableAmbassador(
        ambassadors,
        hoursNeeded
      );

      if (!availableAmbassador) {
        throw new Error("All ambassadors are busy.");
      }

      return await ctx.prisma.scheduledEvent.create({
        data: {
          ownerId: input.ownerId,
          ambassadorId: availableAmbassador.id,
          eventTypeId: input.eventTypeId,
          startTime: input.startTime,
          durationHours: input.durationHours,
        },
      });
    },
  });

function calculateHoursNeededForEvent(startTime: Date, durationHours: number) {
  const hoursNeeded: number[] = [];
  for (
    let h = startTime.getHours();
    h < startTime.getHours() + durationHours;
    h++
  ) {
    hoursNeeded.push(h);
  }
  return hoursNeeded;
}

async function getAmbassadors(prisma: PrismaClient, azStartTime: Date) {
  return await prisma.ambassador.findMany({
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
    where: {
      schedules: {
        some: {
          dayOfWeek: azStartTime.getDay(),
        },
      },
    },
  });
}

type AmbassadorsWithSchedulesAndEvents = Prisma.PromiseReturnType<
  typeof getAmbassadors
>;
type ArrElement<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;
type AmbassadorWithSchedulesAndEvents =
  ArrElement<AmbassadorsWithSchedulesAndEvents>;
function ambassadorIsAvailableForEvent(
  ambassador: AmbassadorWithSchedulesAndEvents,
  hoursNeeded: number[]
) {
  if (ambassador.schedules.length < 1) {
    return false;
  }

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
      let h = utcToZonedTime(exception.start, "America/Phoenix").getHours();
      h < utcToZonedTime(exception.end, "America/Phoenix").getHours();
      h++
    ) {
      //TODO: Handle exceptions that span multiple days
      hoursAvailable.delete(h);
    }
  }

  for (const event of ambassador.scheduledEvents) {
    for (
      let h = utcToZonedTime(event.startTime, "America/Phoenix").getHours();
      h <
      utcToZonedTime(event.startTime, "America/Phoenix").getHours() +
        event.durationHours;
      h++
    ) {
      hoursAvailable.delete(h);
    }
  }

  return hoursNeeded.filter((h) => !hoursAvailable.has(h)).length === 0;
}

function findAvailableAmbassador(
  ambassadors: AmbassadorsWithSchedulesAndEvents,
  hoursNeeded: number[]
) {
  for (const ambassador of ambassadors) {
    if (ambassadorIsAvailableForEvent(ambassador, hoursNeeded)) {
      return ambassador;
    }
  }
  return null;
}
