import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  traceId: string;
};

export const als = new AsyncLocalStorage<RequestContext>();

export function getTraceId(): string {
  return als.getStore()?.traceId ?? "unknown";
}

export function runWithTraceId<T>(traceId: string, fn: () => T): T {
  return als.run({ traceId }, fn);
}
