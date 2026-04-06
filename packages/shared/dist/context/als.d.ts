import { AsyncLocalStorage } from "node:async_hooks";
export type RequestContext = {
    traceId: string;
};
export declare const als: AsyncLocalStorage<RequestContext>;
export declare function getTraceId(): string;
export declare function runWithTraceId<T>(traceId: string, fn: () => T): T;
