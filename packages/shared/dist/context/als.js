"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.als = void 0;
exports.getTraceId = getTraceId;
exports.runWithTraceId = runWithTraceId;
const node_async_hooks_1 = require("node:async_hooks");
exports.als = new node_async_hooks_1.AsyncLocalStorage();
function getTraceId() {
    return exports.als.getStore()?.traceId ?? "unknown";
}
function runWithTraceId(traceId, fn) {
    return exports.als.run({ traceId }, fn);
}
