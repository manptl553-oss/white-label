import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import type { z, ZodType } from "zod";

import { apiCall } from "@/lib/api/client";

export function useZodQuery<TData>(
  options: Omit<UseQueryOptions<TData>, "queryFn"> & {
    queryFn: () => Promise<unknown>;
    schema?: ZodType<TData>;
  },
) {
  const { schema, queryFn, ...rest } = options;

  return useQuery<TData>({
    ...rest,
    queryFn: async () => apiCall(() => queryFn(), schema),
  });
}

export function useZodMutation<TData, TVariables = void>(
  options: Omit<
    UseMutationOptions<TData, unknown, TVariables>,
    "mutationFn"
  > & {
    mutationFn: (variables: TVariables) => Promise<unknown>;
    schema?: ZodType<TData>;
  },
) {
  const { schema, mutationFn, ...rest } = options;

  return useMutation<TData, unknown, TVariables>({
    ...rest,
    mutationFn: async (variables) =>
      apiCall(() => mutationFn(variables), schema),
  });
}

export type InferZod<T extends z.ZodTypeAny> = z.infer<T>;
