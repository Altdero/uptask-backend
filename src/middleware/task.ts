import type { Request, Response, NextFunction } from 'express';

import type { ITask } from '@/models/Task';
import Task from '@/models/Task';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error('Task not found');
      return res.status(404).json({ error: error.message });
    }
    req.task = task;
    next();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
  if (req.task.project.toString() !== req.project._id.toString()) {
    const error = new Error('Unauthorized action');
    return res.status(400).json({ error: error.message });
  }
  next();
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
  if (req.user._id.toString() !== req.project.manager.toString()) {
    const error = new Error('Unauthorized action');
    return res.status(400).json({ error: error.message });
  }
  next();
}
