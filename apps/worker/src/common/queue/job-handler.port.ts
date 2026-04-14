import { Job } from 'bullmq';

export interface JobHandler<TData = unknown, TResult = unknown> {
  readonly name: string;
  handle(job: Job<TData>): Promise<TResult>;
}
