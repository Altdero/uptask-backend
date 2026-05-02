import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from '@/config/db';
import { corsConfig } from '@/config/cors';
import router from '@/routes/index';

config();
void connectDB();

const app = express();
app.use(cors(corsConfig));

// Logging
app.use(morgan('dev'));

// Leer datos de formularios
// eslint-disable-next-line import-x/no-named-as-default-member
app.use(express.json());

// Routes
app.use(router);

export default app;
