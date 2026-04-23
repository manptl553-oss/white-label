import { z } from "zod";

export const ApiErrorModel = z.object({
  error: z.string().nullish(),
  message: z.union([z.string(), z.array(z.string())]).nullish(),
  statusCode: z.number().nullish(),
});

export type ApiError = z.infer<typeof ApiErrorModel>;
