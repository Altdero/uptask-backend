import { config } from 'dotenv';
config();
import mongoose from 'mongoose';
import colors from 'colors';

import { connectDB } from '@/config/db';
import { hashPassword } from '@/utils/auth';
import Note from '@/models/Note';
import Project from '@/models/Project';
import Task from '@/models/Task';
import type { TaskStatus } from '@/models/Task';
import User from '@/models/User';

const DEMO_EMAIL = 'demo@uptask.com';
const DEMO_PASSWORD = 'demo12345678';
const DEMO_NAME = 'Demo User';

const projectsData = [
  {
    projectName: 'E-commerce Platform Redesign',
    clientName: 'Fashion Forward Inc.',
    description: 'Full redesign of the existing e-commerce platform with a modern UI and improved checkout flow.',
  },
  {
    projectName: 'Mobile Banking App',
    clientName: 'SecureBank Ltd.',
    description: 'Cross-platform mobile application for retail banking with real-time transaction tracking.',
  },
  {
    projectName: 'HR Management System',
    clientName: 'TechCorp Solutions',
    description: 'Internal HR portal covering employee onboarding, payroll, and leave management.',
  },
] as const;

const tasksData = [
  [
    { name: 'Design new homepage layout', description: 'Create wireframes and high-fidelity mockups for the redesigned homepage.', status: 'completed' as const },
    { name: 'Implement product catalog', description: 'Build the filterable product listing page with sorting and pagination.', status: 'inProgress' as const },
    { name: 'Set up payment gateway', description: 'Integrate Stripe for checkout and handle webhook events for order updates.', status: 'pending' as const },
    { name: 'Write API documentation', description: 'Document all REST endpoints consumed by the frontend using Swagger.', status: 'underReview' as const },
  ],
  [
    { name: 'User authentication flow', description: 'Implement biometric login, PIN fallback, and session management.', status: 'completed' as const },
    { name: 'Transaction history view', description: 'Display paginated transaction history with date-range filtering.', status: 'onHold' as const },
    { name: 'Push notifications', description: 'Set up FCM push notifications for transaction alerts and promotions.', status: 'inProgress' as const },
  ],
  [
    { name: 'Employee onboarding module', description: 'Build the onboarding checklist and document upload workflow for new hires.', status: 'underReview' as const },
    { name: 'Payroll integration', description: 'Connect the HR portal to the payroll API and schedule monthly payslip generation.', status: 'pending' as const },
    { name: 'Leave management system', description: 'Implement leave request, approval workflow, and balance tracking.', status: 'completed' as const },
  ],
];

const notesData = [
  [
    ['Homepage redesign approved by client in the kickoff meeting.', 'Mobile breakpoints updated to match the new design system.'],
    ['Product filters are working; pagination still needs edge-case testing.'],
    ['Waiting on Stripe test keys from the client before proceeding.'],
    ['First draft submitted for review — awaiting feedback from the backend team.'],
  ],
  [
    ['Biometric login tested on iOS and Android — all cases passing.', 'Session expiry set to 15 minutes of inactivity.'],
    ['Blocked on design clarifications for the filter UI — pinged the design team.'],
    ['FCM integration done; still need to wire up the notification preferences screen.'],
  ],
  [
    ['First review cycle complete; addressed feedback on the document upload size limit.'],
    ['API keys requested from the payroll vendor — ETA next Monday.'],
    ['Leave balance recalculation logic validated against the HR spreadsheet.', 'Approved by the HR manager.'],
  ],
];

async function seed() {
  await connectDB();

  const existingUser = await User.findOne({ email: DEMO_EMAIL });
  if (existingUser) {
    const ownedProjects = await Project.find({ manager: existingUser._id });
    for (const project of ownedProjects) {
      await project.deleteOne();
    }
    await existingUser.deleteOne();
    console.log(colors.yellow('Existing demo data removed.'));
  }

  const user = await User.create({
    email: DEMO_EMAIL,
    password: await hashPassword(DEMO_PASSWORD),
    name: DEMO_NAME,
    confirmed: true,
  });

  for (let pi = 0; pi < projectsData.length; pi++) {
    const project = await Project.create({ ...projectsData[pi], manager: user._id, tasks: [], team: [] });

    for (let ti = 0; ti < tasksData[pi].length; ti++) {
      const taskDef = tasksData[pi][ti];
      const completedBy: { user: mongoose.Types.ObjectId; status: TaskStatus }[] =
        taskDef.status === 'completed' ? [{ user: user._id as mongoose.Types.ObjectId, status: 'completed' }] : [];

      const task = await Task.create({ ...taskDef, project: project._id, completedBy, notes: [] });
      const taskId = task._id as mongoose.Types.ObjectId;

      const noteIds: mongoose.Types.ObjectId[] = [];
      for (const content of notesData[pi][ti]) {
        const note = await Note.create({ content, createdBy: user._id, task: taskId });
        noteIds.push(note._id as mongoose.Types.ObjectId);
      }

      await Task.findByIdAndUpdate(taskId, { $push: { notes: { $each: noteIds } } });
      await Project.findByIdAndUpdate(project._id, { $push: { tasks: taskId } });
    }

    console.log(colors.green(`  Project "${projectsData[pi].projectName}" seeded.`));
  }

  console.log(colors.cyan.bold(`\nDemo credentials — email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`));
  console.log(colors.green.bold('Seed complete.'));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(colors.red.bold('Seed failed:'), err);
  process.exit(1);
});
