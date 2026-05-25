import { Router } from 'express';

import { createNote, deleteNote, getTaskNotes } from '@/controllers/NoteController';
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from '@/controllers/ProjectController';
import { createTask, deleteTask, getProjectTasks, getTaskById, updateStatus, updateTask } from '@/controllers/TaskController';
import { addMemberById, findMemberByEmail, getProjectTeam, removeMemberById } from '@/controllers/TeamController';
import { authenticate } from '@/middleware/auth';
import { projectExists } from '@/middleware/project';
import { hasAuthorization, taskBelongsToProject, taskExists } from '@/middleware/task';
import { validate } from '@/middleware/validation';
import {
  addTeamMemberSchema,
  createNoteSchema,
  createProjectSchema,
  createTaskSchema,
  deleteNoteSchema,
  deleteProjectSchema,
  deleteTaskSchema,
  findTeamMemberSchema,
  getProjectSchema,
  getTaskSchema,
  removeTeamMemberSchema,
  updateProjectSchema,
  updateStatusSchema,
  updateTaskSchema,
} from '@/validations/projectValidations';

const router = Router();

router.use(authenticate);

/** Projects */
router.post('/', validate(createProjectSchema), createProject);
router.get('/', getAllProjects);
router.get('/:id', validate(getProjectSchema), getProjectById);

router.param('projectId', projectExists);

router.put('/:projectId', validate(updateProjectSchema), hasAuthorization, updateProject);
router.delete('/:projectId', validate(deleteProjectSchema), hasAuthorization, deleteProject);

/** Tasks */
router.post('/:projectId/tasks', hasAuthorization, validate(createTaskSchema), createTask);
router.get('/:projectId/tasks', getProjectTasks);

router.param('taskId', taskExists);
router.param('taskId', taskBelongsToProject);

router.get('/:projectId/tasks/:taskId', validate(getTaskSchema), getTaskById);
router.put('/:projectId/tasks/:taskId', hasAuthorization, validate(updateTaskSchema), updateTask);
router.delete('/:projectId/tasks/:taskId', hasAuthorization, validate(deleteTaskSchema), deleteTask);
router.post('/:projectId/tasks/:taskId/status', validate(updateStatusSchema), updateStatus);

/** Team */
router.post('/:projectId/team/find', validate(findTeamMemberSchema), findMemberByEmail);
router.get('/:projectId/team', getProjectTeam);
router.post('/:projectId/team', validate(addTeamMemberSchema), addMemberById);
router.delete('/:projectId/team/:userId', validate(removeTeamMemberSchema), removeMemberById);

/** Notes */
router.post('/:projectId/tasks/:taskId/notes', validate(createNoteSchema), createNote);
router.get('/:projectId/tasks/:taskId/notes', getTaskNotes);
router.delete('/:projectId/tasks/:taskId/notes/:noteId', validate(deleteNoteSchema), deleteNote);

export default router;
