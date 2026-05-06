import express from 'express';

import authRoutes from '@/routes/authRoutes';
import projectRoutes from '@/routes/projectRoutes';

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

export default app;
