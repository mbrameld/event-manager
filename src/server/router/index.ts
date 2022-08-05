// src/server/router/index.ts
import superjson from "superjson";

import { ambassadorRouter } from "./subroutes/ambassador";
import { eventRouter } from "./subroutes/event";
import { eventTypeRouter } from "./subroutes/event-type";
import { dispensaryUserRouter } from "./subroutes/dispensary-user";
import { createProtectedRouter } from "./protected-router";

export const appRouter = createProtectedRouter()
  .transformer(superjson)
  .merge("ambassador.", ambassadorRouter)
  .merge("dispensary.", dispensaryUserRouter)
  .merge("event.", eventRouter)
  .merge("event-type.", eventTypeRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
