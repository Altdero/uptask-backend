import { z } from 'zod';

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID no válido');

const projectBody = z.object({
  projectName: z.string().min(1, 'El Nombre del Proyecto es Obligatorio'),
  clientName: z.string().min(1, 'El Nombre del Cliente es Obligatorio'),
  description: z.string().min(1, 'La Descripción del Proyecto es Obligatoria'),
});

const taskBody = z.object({
  name: z.string().min(1, 'El Nombre de la tarea es Obligatorio'),
  description: z.string().min(1, 'La descripción de la tarea es obligatoria'),
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
  body: z.object({ status: z.string().min(1, 'El estado es obligatorio') }),
};

export const findTeamMemberSchema = {
  body: z.object({
    email: z.email('E-mail no válido').transform((v) => v.toLowerCase()),
  }),
};
export const addTeamMemberSchema = { body: z.object({ id: mongoId }) };
export const removeTeamMemberSchema = { params: z.object({ userId: mongoId }) };

export const createNoteSchema = {
  body: z.object({ content: z.string().min(1, 'El Contenido de la nota es obligatorio') }),
};
export const deleteNoteSchema = { params: z.object({ noteId: mongoId }) };
