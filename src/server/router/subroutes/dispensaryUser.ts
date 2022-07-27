import { createRouter } from "../context";

export const dispensaryUserRouter = createRouter().query("getAll", {
  async resolve({ ctx }) {
    return [];
  },
});
