import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { als } from '@repo/shared';

// Ensures every request has a stable trace id for end-to-end log correlation.
// Reuses `x-trace-id` from upstream (gateway/client) when present, otherwise generates one.
export type RequestWithTraceId = Request & { traceId?: string };

export function traceIdMiddleware(
  req: RequestWithTraceId,
  res: Response,
  next: NextFunction,
) {
  const traceId = (req.headers['x-trace-id'] as string) || randomUUID();

  // Make it available to downstream handlers and return it to the caller.
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);

  als.run({ traceId }, () => next());
}
