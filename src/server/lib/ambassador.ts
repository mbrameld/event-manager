import { z } from "zod";
import {
  AmbassadorSchedule,
  AmbassadorScheduleException,
  ScheduledEvent,
} from "@prisma/client";
import { eachDayOfInterval, lastDayOfMonth, startOfDay } from "date-fns";

export const AmbassadorZod = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  schedules: z
    .array(
      z
        .object({
          startHour: z.number().min(0).max(23),
          endHour: z.number().min(0).max(23),
        })
        .optional()
    )
    .max(7)
    .optional(),
});

export const NULL_AMBASSADOR: {
  id: string | undefined;
  name: string;
  email: string;
  schedules: { startHour: number; endHour: number }[];
} = {
  id: undefined,
  name: "",
  email: "",
  schedules: [],
};

const mapSchedulesToDayOfWeek = (schedules: AmbassadorSchedule[]) =>
  new Map<number, { startHour: number; endHour: number }>(
    schedules.map((s) => [
      s.dayOfWeek,
      { startHour: s.startHour, endHour: s.endHour },
    ])
  );

export const schedulesToSparseArray = (schedules: AmbassadorSchedule[]) => {
  const scheduleMap = mapSchedulesToDayOfWeek(schedules);
  return [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => scheduleMap.get(dayOfWeek));
};

const mapThingsToTheStartOfTheirDay = (
  things: { date: Date; startHour: number; endHour: number }[]
) =>
  things.reduce((thingMap, thing) => {
    if (!thingMap.has(startOfDay(thing.date).valueOf())) {
      thingMap.set(startOfDay(thing.date).valueOf(), []);
    }
    thingMap.get(startOfDay(thing.date).valueOf())?.push(thing);
    return thingMap;
  }, new Map<number, { startHour: number; endHour: number }[]>());

const toMappedAmbassadors = (
  ambassadors: {
    schedules: AmbassadorSchedule[];
    exceptions: AmbassadorScheduleException[];
    scheduledEvents: ScheduledEvent[];
  }[]
) => {
  return ambassadors.map((ambassador) => {
    return {
      scheduledEvents: mapThingsToTheStartOfTheirDay(
        ambassador.scheduledEvents.map((se) => {
          return {
            date: se.startTime,
            startHour: se.startTime.getHours(),
            endHour: se.startTime.getHours() + se.durationHours,
          };
        })
      ),
      exceptions: mapThingsToTheStartOfTheirDay(
        ambassador.exceptions.map((ex) => {
          return {
            date: ex.start,
            startHour: ex.start.getHours(),
            endHour: ex.end.getHours(),
          };
        })
      ),
      schedules: mapSchedulesToDayOfWeek(ambassador.schedules),
    };
  });
};

/**
 *
 * @param year year of
 * @param month
 * @param ambassadors
 * @returns
 */
export const calculateFreeHours = (
  month: Date,
  ambassadors: {
    schedules: AmbassadorSchedule[];
    scheduledEvents: ScheduledEvent[];
    exceptions: AmbassadorScheduleException[];
  }[]
) => {
  const ambassadorsWithDayOfWeekMappedToSchedule =
    toMappedAmbassadors(ambassadors);
  return new Map(
    eachDayOfInterval({
      start: new Date(month.setDate(1)),
      end: lastDayOfMonth(month),
    }).map((d) => {
      const hours = ambassadorsWithDayOfWeekMappedToSchedule.map((s) => {
        // Start with a set of all the hours the ambassador's schedule lets them work this day of the week
        const interval = s.schedules.get(d.getDay());
        const intervalHours = new Set<number>();
        if (interval) {
          for (let h = interval.startHour; h <= interval.endHour; h++) {
            intervalHours.add(h);
          }
        }
        // For each exception on this day, remove hours
        const exceptionsOnThisDay =
          s.exceptions.get(startOfDay(d).valueOf()) ?? [];
        for (let exception of exceptionsOnThisDay) {
          for (let h = exception.startHour; h < exception.endHour; h++) {
            intervalHours.delete(h);
          }
        }
        // For each scheduled event on this day, remove hours
        const eventsOnThisDay =
          s.scheduledEvents.get(startOfDay(d).valueOf()) ?? [];
        for (let event of eventsOnThisDay) {
          for (let h = event.startHour; h < event.endHour; h++) {
            intervalHours.delete(h);
          }
        }
        return Array.from(intervalHours);
      });
      return [d.getDate(), hours] as const;
    })
  );
};

/**
 *
 * @param schedules a sparse array from the ambassador UI.
 * Position in the array corresponds to the day of the week.
 * Sunday-Saturday = 0-6
 * @returns an array of schedules ready to be saved to the database.
 */
export const scheduleFormValuesToDatabaseModels = (
  schedules?:
    | (
        | {
            startHour: number;
            endHour: number;
          }
        | undefined
      )[]
    | undefined
) =>
  [0, 1, 2, 3, 4, 5, 6]
    .filter(
      (dayOfWeek) =>
        schedules && schedules.length > dayOfWeek && schedules[dayOfWeek]
    )
    .map((dayOfWeek) => {
      return {
        dayOfWeek,
        startHour: schedules?.[dayOfWeek]!.startHour!, // These are safe due to the filter above
        endHour: schedules?.[dayOfWeek]!.endHour!,
      };
    });
