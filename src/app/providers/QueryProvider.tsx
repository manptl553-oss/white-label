import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { toast } from "@/components";

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Something went wrong. Please try again.";
  }

  const err = error as Record<string, unknown>;

  // Standard AxiosError: error.response.data.message
  const response = err.response as Record<string, unknown> | undefined;
  if (response?.data && typeof response.data === "object") {
    const data = response.data as Record<string, unknown>;
    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof data.error === "string" && data.error) return data.error;
  }

  // Pre-extracted data: error.data.message
  if (err.data && typeof err.data === "object") {
    const data = err.data as Record<string, unknown>;
    if (typeof data.message === "string" && data.message) return data.message;
  }

  // Direct message on error object (e.g. Error instance or { message: "..." })
  if (typeof err.message === "string" && err.message) return err.message;

  return "Something went wrong. Please try again.";
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(getErrorMessage(error));
          },
        }),
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
