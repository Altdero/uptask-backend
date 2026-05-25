import { z } from 'zod';

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

const projectBody = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  clientName: z.string().min(1, 'Client name is required'),
  description: z.string().min(1, 'Description is required'),
});

const taskBody = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().min(1, 'Description is required'),
});

export const getProjectSchema = { params: z.object({ id: mongoId }) };
export const createProjectSchema = { body: projectBody };
export const updateProjectSchema = { params: z.object({ projectId: mongoId }), body: projectBody };
export const deleteProjectSchema = { params: z.object({ projectId: mongoId }) };

export const createTaskSchema = { body: taskBody };
export const getTaskSchema = { params: z.object({ taskId: mongoId }) };
export const updateTaskSchema = { params: z.object({ taskId: mongoId }), body: taskBody };
export const deleteTaskSchema = { params: z.object({ taskId: mongoId }) };
export const updateStatusSchema = {
  params: z.object({ taskId: mongoId }),
  body: z.object({ status: z.string().min(1, 'Status is required') }),
};

export const findTeamMemberSchema = {
  body: z.object({
    email: z.email('Invalid email address').transform((v) => v.toLowerCase()),
  }),
};
export const addTeamMemberSchema = { body: z.object({ id: mongoId }) };
export const removeTeamMemberSchema = { params: z.object({ userId: mongoId }) };

export const createNoteSchema = {
  body: z.object({ content: z.string().min(1, 'Note content is required') }),
};
export const deleteNoteSchema = { params: z.object({ noteId: mongoId }) };
