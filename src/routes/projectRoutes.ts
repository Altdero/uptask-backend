import { Router } from 'express';
import { body, param } from 'express-validator';

import { createNote, deleteNote, getTaskNotes } from '@/controllers/NoteController';
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from '@/controllers/ProjectController';
import { createTask, deleteTask, getProjectTasks, getTaskById, updateStatus, updateTask } from '@/controllers/TaskController';
import { addMemberById, findMemberByEmail, getProjectTeam, removeMemberById } from '@/controllers/TeamController';
import { authenticate } from '@/middleware/auth';
import { projectExists } from '@/middleware/project';
import { hasAuthorization, taskBelongsToProject, taskExists } from '@/middleware/task';
import { handleInputErrors } from '@/middleware/validation';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
  body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
  body('description').notEmpty().withMessage('La Descripción del Proyecto es Obligatoria'),
  handleInputErrors,
  createProject
);

router.get('/', getAllProjects);

router.get('/:id', param('id').isMongoId().withMessage('ID no válido'), handleInputErrors, getProjectById);

/** Routes for tasks */
router.param('projectId', projectExists);

router.put(
  '/:projectId',
  param('projectId').isMongoId().withMessage('ID no válido'),
  body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
  body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
  body('description').notEmpty().withMessage('La Descripción del Proyecto es Obligatoria'),
  handleInputErrors,
  hasAuthorization,
  updateProject
);

router.delete('/:projectId', param('projectId').isMongoId().withMessage('ID no válido'), handleInputErrors, hasAuthorization, deleteProject);

router.post(
  '/:projectId/tasks',
  hasAuthorization,
  body('name').notEmpty().withMessage('El Nombre de la tarea es Obligatorio'),
  body('description').notEmpty().withMessage('La descripción de la tarea es obligatoria'),
  handleInputErrors,
  createTask
);

router.get('/:projectId/tasks', getProjectTasks);

router.param('taskId', taskExists);
router.param('taskId', taskBelongsToProject);

router.get('/:projectId/tasks/:taskId', param('taskId').isMongoId().withMessage('ID no válido'), handleInputErrors, getTaskById);

router.put(
  '/:projectId/tasks/:taskId',
  hasAuthorization,
  param('taskId').isMongoId().withMessage('ID no válido'),
  body('name').notEmpty().withMessage('El Nombre de la tarea es Obligatorio'),
  body('description').notEmpty().withMessage('La descripción de la tarea es obligatoria'),
  handleInputErrors,
  updateTask
);

router.delete('/:projectId/tasks/:taskId', hasAuthorization, param('taskId').isMongoId().withMessage('ID no válido'), handleInputErrors, deleteTask);

router.post(
  '/:projectId/tasks/:taskId/status',
  param('taskId').isMongoId().withMessage('ID no válido'),
  body('status').notEmpty().withMessage('El estado es obligatorio'),
  handleInputErrors,
  updateStatus
);

/** Routes for teams */
router.post('/:projectId/team/find', body('email').isEmail().toLowerCase().withMessage('E-mail no válido'), handleInputErrors, findMemberByEmail);

router.get('/:projectId/team', getProjectTeam);

router.post('/:projectId/team', body('id').isMongoId().withMessage('ID No válido'), handleInputErrors, addMemberById);

router.delete('/:projectId/team/:userId', param('userId').isMongoId().withMessage('ID No válido'), handleInputErrors, removeMemberById);

/** Routes for Notes */
router.post('/:projectId/tasks/:taskId/notes', body('content').notEmpty().withMessage('El Contenido de la nota es obligatorio'), handleInputErrors, createNote);

router.get('/:projectId/tasks/:taskId/notes', getTaskNotes);

router.delete('/:projectId/tasks/:taskId/notes/:noteId', param('noteId').isMongoId().withMessage('ID No Válido'), handleInputErrors, deleteNote);

export default router;
