import { config } from 'dotenv';
config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { connectDB } from '@/config/db';
import { corsConfig } from '@/config/cors';
import router from '@/routes/index';
import { swaggerSpec } from '@/config/swagger';

// Initialize dotenv immediately before importing custom configuration modules
// config();

// Executes database connection function while explicitly telling TypeScript don't intend to wait for its results.
void connectDB();

// Creates express instance
const app = express();

// Tell Express it operates behind Render's HTTPS reverse proxy infrastructure
app.set('trust proxy', 1);

// Apply global CORS security policies
app.use(cors(corsConfig));

// Intercept preflight OPTIONS requests using Express v5-safe named wildcard syntax
app.options('/*splat', cors(corsConfig));

// Logging
app.use(morgan('dev'));

// Automatically reads and parses incoming JSON payloads from request bodies
// eslint-disable-next-line import-x/no-named-as-default-member
app.use(express.json());

// Interactive Swagger UI API Documentation Engine
// eslint-disable-next-line import-x/no-named-as-default-member
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Application API Router Middleware
app.use(router);

export default app;
