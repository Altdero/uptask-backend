import type { Request, Response } from 'express';

import Project from '@/models/Project';

export const createProject = async (req: Request, res: Response) => {
  const project = new Project(req.body);

  project.manager = req.user._id;
  try {
    await project.save();
    res.send('Project created successfully');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [{ manager: req.user._id }, { team: req.user._id }],
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id).populate('tasks');
    if (!project) {
      const error = new Error('Project not found');
      return res.status(404).json({ error: error.message });
    }
    if (project.manager.toString() !== req.user._id.toString() && !project.team.includes(req.user._id)) {
      const error = new Error('Unauthorized action');
      return res.status(403).json({ error: error.message });
    }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    req.project.clientName = req.body.clientName;
    req.project.projectName = req.body.projectName;
    req.project.description = req.body.description;

    await req.project.save();
    res.send('Project updated');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    await req.project.deleteOne();
    res.send('Project deleted');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
