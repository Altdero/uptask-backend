import { Router } from 'express';

import { createNote, deleteNote, getTaskNotes } from '@/controllers/NoteController';
import { createProject, deleteProject, getAllProjects, getProjectById, updateProject } from '@/controllers/ProjectController';
import { createTask, deleteTask, getProjectTasks, getTaskById, updateStatus, updateTask } from '@/controllers/TaskController';
import { addMemberById, findMemberByEmail, getProjectTeam, removeMemberById } from '@/controllers/TeamController';
import { authenticate } from '@/middleware/auth';
import { projectExists } from '@/middleware/project';
import { hasAuthorization, taskBelongsToProject, taskExists } from '@/middleware/task';
import { handleInputErrors } from '@/middleware/validation';
import {
  addTeamMemberRules,
  createNoteRules,
  createProjectRules,
  createTaskRules,
  deleteNoteRules,
  deleteProjectRules,
  deleteTaskRules,
  findTeamMemberRules,
  getProjectRules,
  getTaskRules,
  removeTeamMemberRules,
  updateProjectRules,
  updateStatusRules,
  updateTaskRules,
} from '@/validations/projectValidations';

const router = Router();

router.use(authenticate);

/** Projects */
router.post('/', createProjectRules, handleInputErrors, createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectRules, handleInputErrors, getProjectById);

router.param('projectId', projectExists);

router.put('/:projectId', updateProjectRules, handleInputErrors, hasAuthorization, updateProject);
router.delete('/:projectId', deleteProjectRules, handleInputErrors, hasAuthorization, deleteProject);

/** Tasks */
router.post('/:projectId/tasks', hasAuthorization, createTaskRules, handleInputErrors, createTask);
router.get('/:projectId/tasks', getProjectTasks);

router.param('taskId', taskExists);
router.param('taskId', taskBelongsToProject);

router.get('/:projectId/tasks/:taskId', getTaskRules, handleInputErrors, getTaskById);
router.put('/:projectId/tasks/:taskId', hasAuthorization, updateTaskRules, handleInputErrors, updateTask);
router.delete('/:projectId/tasks/:taskId', hasAuthorization, deleteTaskRules, handleInputErrors, deleteTask);
router.post('/:projectId/tasks/:taskId/status', updateStatusRules, handleInputErrors, updateStatus);

/** Team */
router.post('/:projectId/team/find', findTeamMemberRules, handleInputErrors, findMemberByEmail);
router.get('/:projectId/team', getProjectTeam);
router.post('/:projectId/team', addTeamMemberRules, handleInputErrors, addMemberById);
router.delete('/:projectId/team/:userId', removeTeamMemberRules, handleInputErrors, removeMemberById);

/** Notes */
router.post('/:projectId/tasks/:taskId/notes', createNoteRules, handleInputErrors, createNote);
router.get('/:projectId/tasks/:taskId/notes', getTaskNotes);
router.delete('/:projectId/tasks/:taskId/notes/:noteId', deleteNoteRules, handleInputErrors, deleteNote);

export default router;
