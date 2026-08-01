import type { TaskInput, TaskResult } from './jsonProcessor';

/**
 * Runs a JSON processing task off the main thread via a Web Worker.
 * Falls back to (dynamically imported) synchronous execution when Workers
 * are unavailable, keeping the heavy processor out of the initial bundle.
 */

interface Pending {
  task: TaskInput;
  resolve: (result: TaskResult) => void;
}

let worker: Worker | null = null;
let pending = new Map<number, Pending>();
let nextId = 0;
let processorModule: Promise<typeof import('./jsonProcessor')> | null = null;

function getProcessor(): Promise<typeof import('./jsonProcessor')> {
  if (!processorModule) {
    processorModule = import('./jsonProcessor');
  }
  return processorModule;
}

function createWorker(): Worker | null {
  if (typeof window === 'undefined') return null;
  try {
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (event: MessageEvent<{ id: number; result: TaskResult }>) => {
      const entry = pending.get(event.data.id);
      if (entry) {
        pending.delete(event.data.id);
        entry.resolve(event.data.result);
      }
    };
    w.onerror = () => {
      const entries = Array.from(pending.values());
      pending.clear();
      worker = null;
      getProcessor().then((mod) => {
        for (const entry of entries) {
          try {
            entry.resolve(mod.runTask(entry.task));
          } catch (err) {
            entry.resolve({
              ok: false,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      });
    };
    return w;
  } catch {
    return null;
  }
}

export async function runTaskAsync(task: TaskInput): Promise<TaskResult> {
  const w = worker ?? (worker = createWorker());
  if (!w) {
    const mod = await getProcessor();
    return mod.runTask(task);
  }
  return new Promise<TaskResult>((resolve) => {
    const id = nextId++;
    pending.set(id, { task, resolve });
    w.postMessage({ id, task });
  });
}
