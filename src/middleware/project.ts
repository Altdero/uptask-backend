import type { NextFunction, Request, Response } from 'express';

import type { IProject } from '@/models/Project';
import Project from '@/models/Project';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

export async function projectExists(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      return res.status(404).json({ error: error.message });
    }
    req.project = project;
    next();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
