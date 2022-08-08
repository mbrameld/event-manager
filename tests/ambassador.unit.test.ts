import { AmbassadorSchedule } from "@prisma/client";
import {
  NULL_AMBASSADOR,
  schedulesToSparseArray,
  calculateFreeHours, //TODO
  scheduleFormValuesToDatabaseModels,
} from "../src/server/lib/ambassador";

test("scheduleFormValuesToDatabaseModels when schedule is undefined returns an empty array", () => {
  const schedule = undefined;

  const result = scheduleFormValuesToDatabaseModels(schedule);

  expect(result).toEqual([]);
});

test("scheduleFormValuesToDatabaseModels when schedule is empty returns an empty array", () => {
  const result = scheduleFormValuesToDatabaseModels([]);

  expect(result).toEqual([]);
});

test("scheduleFormValuesToDatabaseModels when schedule is incomplete and sparse assigns the correct day of the week", () => {
  const schedule = [
    undefined,
    undefined,
    undefined,
    { startHour: 10, endHour: 18 },
  ];

  const result = scheduleFormValuesToDatabaseModels(schedule);

  expect(result.length).toBe(1);
  expect(result).toEqual([{ dayOfWeek: 3, startHour: 10, endHour: 18 }]);
});

test("scheduleFormValuesToDatabaseModels when schedule is complete but sparse assigns the correct day of the week", () => {
  const schedule = [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { startHour: 10, endHour: 18 },
  ];

  const result = scheduleFormValuesToDatabaseModels(schedule);

  expect(result.length).toBe(1);
  expect(result).toEqual([{ dayOfWeek: 6, startHour: 10, endHour: 18 }]);
});

test("scheduleFormValuesToDatabaseModels when schedule is full assigns the correct day of the week", () => {
  const schedule = [
    { startHour: 10, endHour: 18 },
    { startHour: 11, endHour: 19 },
    { startHour: 12, endHour: 20 },
    { startHour: 13, endHour: 21 },
    { startHour: 14, endHour: 22 },
    { startHour: 15, endHour: 23 },
    { startHour: 9, endHour: 17 },
  ];

  const result = scheduleFormValuesToDatabaseModels(schedule);

  expect(result.length).toBe(7);
  expect(result.sort((l, r) => l.dayOfWeek - r.dayOfWeek)).toEqual(
    [
      { dayOfWeek: 0, startHour: 10, endHour: 18 },
      { dayOfWeek: 1, startHour: 11, endHour: 19 },
      { dayOfWeek: 2, startHour: 12, endHour: 20 },
      { dayOfWeek: 3, startHour: 13, endHour: 21 },
      { dayOfWeek: 4, startHour: 14, endHour: 22 },
      { dayOfWeek: 5, startHour: 15, endHour: 23 },
      { dayOfWeek: 6, startHour: 9, endHour: 17 },
    ].sort((l, r) => l.dayOfWeek - r.dayOfWeek)
  );
});

test("scheduleFormValuesToDatabaseModels ignores out of range schedules", () => {
  const schedule = [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { startHour: 10, endHour: 18 },
  ];

  const result = scheduleFormValuesToDatabaseModels(schedule);

  expect(result).toEqual([]);
});

test("NULL_AMBASSADOR fields are set correctly", () => {
  expect(NULL_AMBASSADOR.id).toBe(undefined);
  expect(NULL_AMBASSADOR.name).toBe("");
  expect(NULL_AMBASSADOR.email).toBe("");
  expect(NULL_AMBASSADOR.schedules).toEqual([]);
});

test("schedulesToSparseArray handles a full schedule in any order", () => {
  const schedules = [5, 3, 6, 1, 4, 2, 0].map((dayOfWeek) => {
    return {
      id: dayOfWeek,
      dayOfWeek,
      startHour: dayOfWeek,
      endHour: dayOfWeek,
      ambassadorId: "",
    };
  });

  const result = schedulesToSparseArray(schedules);

  expect(result.length).toBe(7);
  for (let dayOfWeek of [0, 1, 2, 3, 4, 5, 6]) {
    expect(result[dayOfWeek]).toEqual({
      startHour: dayOfWeek,
      endHour: dayOfWeek,
    });
  }
});

test("schedulesToSparseArray handles a sparse schedule in any order", () => {
  const schedules = [5, 2].map((dayOfWeek) => {
    return {
      id: dayOfWeek,
      dayOfWeek,
      startHour: dayOfWeek,
      endHour: dayOfWeek,
      ambassadorId: "",
    };
  });

  const result = schedulesToSparseArray(schedules);

  expect(result.length).toBe(7);
  for (let dayOfWeek of [2, 5]) {
    expect(result[dayOfWeek]).toEqual({
      startHour: dayOfWeek,
      endHour: dayOfWeek,
    });
  }

  for (let dayOfWeek of [0, 1, 3, 4, 6]) {
    expect(result[dayOfWeek]).toBeUndefined();
  }
});

test("schedulesToSparseArray handles an empty schedule", () => {
  const result = schedulesToSparseArray([]);

  expect(result.length).toBe(7);
  for (let dayOfWeek of [0, 1, 2, 3, 4, 5, 6]) {
    expect(result[dayOfWeek]).toBeUndefined();
  }
});

test("schedulesToSparseArray ignores out of range schedules", () => {
  const schedules = [7, -1, 5, 2, 8].map((dayOfWeek) => {
    return {
      id: dayOfWeek,
      dayOfWeek,
      startHour: dayOfWeek,
      endHour: dayOfWeek,
      ambassadorId: "",
    };
  });

  const result = schedulesToSparseArray(schedules);

  expect(result.length).toBe(7);
  for (let dayOfWeek of [2, 5]) {
    expect(result[dayOfWeek]).toEqual({
      startHour: dayOfWeek,
      endHour: dayOfWeek,
    });
  }
  for (let dayOfWeek of [0, 1, 3, 4, 6]) {
    expect(result[dayOfWeek]).toBeUndefined();
  }
});
