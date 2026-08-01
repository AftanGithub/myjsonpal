/// <reference lib="webworker" />
import { runTask, type TaskInput, type TaskResult } from './jsonProcessor';

interface WorkerRequest {
  id: number;
  task: TaskInput;
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, task } = event.data;
  let result: TaskResult;
  try {
    result = runTask(task);
  } catch (err) {
    result = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
  (self as unknown as Worker).postMessage({ id, result });
};
