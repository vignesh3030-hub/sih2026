import { InfrastructureProject } from '../types';

export interface TaskJob<T = any> {
  id: string;
  fn: () => Promise<T> | T;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  createdAt: number;
}

/**
 * Async Non-Blocking Task Queue & Worker Pool
 * Offloads CPU-bound batch risk analytical operations from blocking Node's main event loop.
 */
export class AsyncProjectWorkerPool {
  private queue: TaskJob[] = [];
  private activeWorkers = 0;
  private maxConcurrency: number;

  constructor(maxConcurrency = 8) {
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Enqueues an analytical or CPU-bound task for non-blocking asynchronous execution
   */
  public enqueue<T>(taskFn: () => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const job: TaskJob<T> = {
        id: `job-${Math.random().toString(36).substr(2, 9)}`,
        fn: taskFn,
        resolve,
        reject,
        createdAt: performance.now(),
      };

      this.queue.push(job);
      this.processNext();
    });
  }

  private processNext() {
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeWorkers++;

    // Execute via setImmediate to allow event-loop microtask yield
    setImmediate(async () => {
      try {
        const result = await Promise.resolve(job.fn());
        job.resolve(result);
      } catch (err) {
        job.reject(err);
      } finally {
        this.activeWorkers--;
        this.processNext();
      }
    });
  }

  /**
   * Batch process multiple project risk predictions concurrently
   */
  public async batchProcess<I, R>(
    items: I[],
    processor: (item: I) => Promise<R> | R,
    batchSize = 50
  ): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((item) => this.enqueue(() => processor(item)))
      );
      results.push(...batchResults);
    }
    return results;
  }

  public getQueueMetrics() {
    return {
      pendingJobs: this.queue.length,
      activeWorkers: this.activeWorkers,
      maxConcurrency: this.maxConcurrency,
    };
  }
}

export const globalWorkerPool = new AsyncProjectWorkerPool(16);
