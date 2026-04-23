import type { AxiosRequestConfig } from "axios";
import { z, type ZodType } from "zod";

import { getAxiosInstance } from "@/lib/api";

export async function axiosGet<T>(
  url: string,
  params?: object,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await getAxiosInstance().get(url, { params, ...config });
  return res.data as T;
}

export async function axiosPost<T>(
  url: string,
  data: object | null,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await getAxiosInstance().post(url, data, config);
  return res.data as T;
}

export async function axiosPut<T>(
  url: string,
  data: object | null,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await getAxiosInstance().put(url, data, config);
  return res.data as T;
}

export async function axiosPatch<T>(
  url: string,
  data: object | null,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await getAxiosInstance().patch(url, data, config);
  return res.data as T;
}

export async function axiosDelete<T>(
  url: string,
  data?: object | null,
): Promise<T> {
  const config = data ? { data } : undefined;
  const res = await getAxiosInstance().delete(url, config);
  return res.data as T;
}

export async function apiCall<T>(
  fn: () => Promise<unknown>,
  schema?: ZodType<T>,
): Promise<T> {
  const data = await fn();
  if (!schema) return data as T;
  return schema.parse(data);
}

export function zodJson<T extends z.ZodTypeAny>(schema: T) {
  return (data: unknown) => schema.parse(data);
}
