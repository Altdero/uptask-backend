import type { Request, Response } from 'express';

import Task from '@/models/Task';

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = new Task(req.body);
    task.project = req.project._id;
    req.project.tasks.push(task._id);
    await Promise.allSettled([task.save(), req.project.save()]);
    res.send('Task created successfully');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ project: req.project._id }).populate('project');
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const [task] = await Task.aggregate([
      { $match: { _id: req.task._id } },
      { $project: { name: 1, description: 1, project: 1, status: 1, notes: 1, createdAt: 1, updatedAt: 1, completedBy: { $slice: ['$completedBy', -5] } } },
      { $lookup: { from: 'users', localField: 'completedBy.user', foreignField: '_id', as: 'completedByUsers' } },
      {
        $addFields: {
          completedBy: {
            $map: {
              input: '$completedBy',
              as: 'entry',
              in: {
                _id: '$$entry._id',
                status: '$$entry.status',
                user: {
                  $let: {
                    vars: { u: { $arrayElemAt: ['$completedByUsers', { $indexOfArray: ['$completedByUsers._id', '$$entry.user'] }] } },
                    in: { _id: '$$u._id', name: '$$u.name', email: '$$u.email' },
                  },
                },
              },
            },
          },
        },
      },
      { $lookup: { from: 'notes', localField: 'notes', foreignField: '_id', as: 'notes' } },
      { $lookup: { from: 'users', localField: 'notes.createdBy', foreignField: '_id', as: 'noteAuthors' } },
      {
        $addFields: {
          notes: {
            $map: {
              input: '$notes',
              as: 'note',
              in: {
                _id: '$$note._id',
                content: '$$note.content',
                task: '$$note.task',
                createdAt: '$$note.createdAt',
                createdBy: {
                  $let: {
                    vars: { u: { $arrayElemAt: ['$noteAuthors', { $indexOfArray: ['$noteAuthors._id', '$$note.createdBy'] }] } },
                    in: { _id: '$$u._id', name: '$$u.name', email: '$$u.email' },
                  },
                },
              },
            },
          },
        },
      },
      { $project: { completedByUsers: 0, noteAuthors: 0 } },
    ]);
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    req.task.name = req.body.name;
    req.task.description = req.body.description;
    await req.task.save();
    res.send('Task updated successfully');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    req.project.tasks = req.project.tasks.filter((task) => task.toString() !== req.task._id.toString());
    await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
    res.send('Task deleted successfully');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    req.task.status = status;
    const data = {
      user: req.user._id,
      status,
    };
    req.task.completedBy.push(data);
    await req.task.save();
    res.send('Task updated');
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
