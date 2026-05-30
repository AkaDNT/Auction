import { Prisma } from '@prisma/client';

export async function runWithTransactionRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelayMs?: number;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 50;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryableTransactionError(error) || attempt === maxRetries) {
        throw error;
      }

      await sleep(baseDelayMs * attempt);
    }
  }

  throw lastError;
}

function isRetryableTransactionError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }

  // P2034: Transaction failed due to a write conflict or a deadlock.
  return error.code === 'P2034';
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
