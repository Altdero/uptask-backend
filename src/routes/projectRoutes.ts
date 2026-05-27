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
  createTaskSchema,
} from '@/validations/projectValidations';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Projects
 *     description: Project management
 *   - name: Tasks
 *     description: Task management within a project
 *   - name: Team
 *     description: Team membership within a project
 *   - name: Notes
 *     description: Notes on tasks
 */

// ─── Projects ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectName, clientName, description]
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: Website Redesign
 *               clientName:
 *                 type: string
 *                 example: Acme Corp
 *               description:
 *                 type: string
 *                 example: Full redesign of the corporate website
 *     responses:
 *       200:
 *         description: Project created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createProjectSchema), createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List all projects where the user is manager or team member
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project with its tasks
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     responses:
 *       200:
 *         description: Project with populated tasks
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       403:
 *         description: Not a member of this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validate(getProjectSchema), getProjectById);

router.param('projectId', projectExists);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   put:
 *     summary: Update a project (manager only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectName, clientName, description]
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: Website Redesign v2
 *               clientName:
 *                 type: string
 *                 example: Acme Corp
 *               description:
 *                 type: string
 *                 example: Updated scope
 *     responses:
 *       200:
 *         description: Project updated
 *       403:
 *         description: Not the project manager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:projectId', validate(updateProjectSchema), hasAuthorization, updateProject);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   delete:
 *     summary: Delete a project and all its tasks and notes (manager only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     responses:
 *       200:
 *         description: Project deleted
 *       403:
 *         description: Not the project manager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:projectId', validate(deleteProjectSchema), hasAuthorization, deleteProject);

// ─── Tasks ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Create a task (manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Design mockups
 *               description:
 *                 type: string
 *                 example: Create wireframes and hi-fi mockups
 *     responses:
 *       200:
 *         description: Task created
 *       403:
 *         description: Not the project manager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:projectId/tasks', hasAuthorization, validate(createTaskSchema), createTask);

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   get:
 *     summary: List all tasks in a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     responses:
 *       200:
 *         description: Array of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:projectId/tasks', getProjectTasks);

router.param('taskId', taskExists);
router.param('taskId', taskBelongsToProject);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     summary: Get a task with notes and last 5 status changes
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     responses:
 *       200:
 *         description: Task with notes and status history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Project or task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:projectId/tasks/:taskId', validate(getTaskSchema), getTaskById);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}:
 *   put:
 *     summary: Update a task name and description (manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Design mockups v2
 *               description:
 *                 type: string
 *                 example: Updated scope
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Not the project manager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project or task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:projectId/tasks/:taskId', hasAuthorization, validate(updateTaskSchema), updateTask);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task (manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Not the project manager
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project or task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:projectId/tasks/:taskId', hasAuthorization, validate(deleteTaskSchema), deleteTask);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/status:
 *   post:
 *     summary: Update task status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, onHold, inProgress, underReview, completed]
 *                 example: inProgress
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project or task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:projectId/tasks/:taskId/status', validate(updateStatusSchema), updateStatus);

// ─── Team ─────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/projects/{projectId}/team/find:
 *   post:
 *     summary: Find a user by email to add to the team
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:projectId/team/find', validate(findTeamMemberSchema), findMemberByEmail);

/**
 * @swagger
 * /api/projects/{projectId}/team:
 *   get:
 *     summary: List team members
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     responses:
 *       200:
 *         description: Array of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:projectId/team', getProjectTeam);

/**
 * @swagger
 * /api/projects/{projectId}/team:
 *   post:
 *     summary: Add a member to the project by user ID
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id:
 *                 type: string
 *                 example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     responses:
 *       200:
 *         description: Member added
 *       409:
 *         description: User is already a team member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User or project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:projectId/team', validate(addTeamMemberSchema), addMemberById);

/**
 * @swagger
 * /api/projects/{projectId}/team/{userId}:
 *   delete:
 *     summary: Remove a member from the project
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     responses:
 *       200:
 *         description: Member removed
 *       404:
 *         description: User or project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:projectId/team/:userId', validate(removeTeamMemberSchema), removeMemberById);

// ─── Notes ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/notes:
 *   post:
 *     summary: Create a note on a task
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: Remember to check the brand guidelines
 *     responses:
 *       200:
 *         description: Note created
 *       404:
 *         description: Project or task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:projectId/tasks/:taskId/notes', validate(createNoteSchema), createNote);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/notes:
 *   get:
 *     summary: List all notes on a task
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *     responses:
 *       200:
 *         description: Array of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       404:
 *         description: Project or task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:projectId/tasks/:taskId/notes', getTaskNotes);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}/notes/{noteId}:
 *   delete:
 *     summary: Delete own note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e1
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e2
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64a1b2c3d4e5f6a7b8c9d0e3
 *     responses:
 *       200:
 *         description: Note deleted
 *       403:
 *         description: Not the note author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:projectId/tasks/:taskId/notes/:noteId', validate(deleteNoteSchema), deleteNote);

export default router;
