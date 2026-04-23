import { env } from "@/config/env";

const isDev =
  env.VITE_APP_ENV === "development" || import.meta.env.MODE === "development";

type LoggerArgs = unknown[];

export const logger = {
  log: (...args: LoggerArgs) => {
    if (isDev) {
      console.log(...args);
    }
  },
  error: (...args: LoggerArgs) => {
    if (isDev) {
      console.error(...args);
    }
  },
  warn: (...args: LoggerArgs) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  debug: (...args: LoggerArgs) => {
    if (isDev) {
      console.debug(...args);
    }
  },
  info: (...args: LoggerArgs) => {
    if (isDev) {
      console.info(...args);
    }
  },
};
