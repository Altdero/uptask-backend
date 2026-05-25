import { body, param } from 'express-validator';

const projectIdRules = param('projectId').isMongoId().withMessage('ID no válido');
const taskIdRules = param('taskId').isMongoId().withMessage('ID no válido');

const projectBodyRules = [
  body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
  body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
  body('description').notEmpty().withMessage('La Descripción del Proyecto es Obligatoria'),
];

const taskBodyRules = [
  body('name').notEmpty().withMessage('El Nombre de la tarea es Obligatorio'),
  body('description').notEmpty().withMessage('La descripción de la tarea es obligatoria'),
];

export const getProjectRules = [param('id').isMongoId().withMessage('ID no válido')];

export const createProjectRules = projectBodyRules;

export const updateProjectRules = [projectIdRules, ...projectBodyRules];

export const deleteProjectRules = [projectIdRules];

export const createTaskRules = [taskIdRules, ...taskBodyRules];

export const getTaskRules = [taskIdRules];

export const updateTaskRules = [taskIdRules, ...taskBodyRules];

export const deleteTaskRules = [taskIdRules];

export const updateStatusRules = [taskIdRules, body('status').notEmpty().withMessage('El estado es obligatorio')];

export const findTeamMemberRules = [body('email').isEmail().toLowerCase().withMessage('E-mail no válido')];

export const addTeamMemberRules = [body('id').isMongoId().withMessage('ID No válido')];

export const removeTeamMemberRules = [param('userId').isMongoId().withMessage('ID No válido')];

export const createNoteRules = [body('content').notEmpty().withMessage('El Contenido de la nota es obligatorio')];

export const deleteNoteRules = [param('noteId').isMongoId().withMessage('ID No Válido')];
