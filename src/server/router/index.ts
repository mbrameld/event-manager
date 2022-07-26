// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./subroutes/auth";
import { ambassadorRouter } from "./subroutes/ambassador";
import { eventRouter } from "./subroutes/event";
import { eventAdminRouter } from "./subroutes/event-admin";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("event.", eventRouter)
  .merge("event-admin.", eventAdminRouter)
  .merge("ambassador.", ambassadorRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
