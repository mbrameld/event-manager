import type { Config } from "@jest/types";

// Or async function
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
export default config;
