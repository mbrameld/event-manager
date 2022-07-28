// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./subroutes/auth";
import { ambassadorRouter } from "./subroutes/ambassador";
import { eventRouter } from "./subroutes/event";
import { eventTypeRouter } from "./subroutes/event-type";
import { dispensaryUserRouter } from "./subroutes/dispensary-user";
import { TRPCError } from "@trpc/server";

export const appRouter = createRouter()
  .transformer(superjson)
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .merge("ambassador.", ambassadorRouter)
  .merge("auth.", authRouter)
  .merge("dispensary.", dispensaryUserRouter)
  .merge("event.", eventRouter)
  .merge("event-type.", eventTypeRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
