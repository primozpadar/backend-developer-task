import connectRedis from 'connect-redis';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import morgan from 'morgan';
import path from 'path';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { __prod__, __test__ } from './constants';
import { celebrateErrorHandler, customErrorHandler, defaultErrorHandler } from './handlers/error';
import authRouter from './routes/auth';
import folderRouter from './routes/folder';
import noteRouter from './routes/note';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    user?: { id: number; username: string; name: string };
  }
}

if (!__prod__) {
  dotenv.config({ path: '.env' });
}

const app = express();

if (!__prod__ && !__test__) {
  const swaggerDocs = swaggerJsDoc({
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Notes API',
        description: 'Celtra backend task',
        version: '1.0'
      }
    },
    apis: [path.join(__dirname, 'routes/**/*.ts')]
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// dont log if tests are running
if (!__test__) {
  app.use(morgan('dev'));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session setup
app.enable('trust proxy');
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
const RedisStore = connectRedis(session);
const redis = new Redis(process.env.REDIS_URL);
app.use(
  session({
    name: 'NOTES_API_COOKIE',
    store: new RedisStore({ client: redis }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      sameSite: 'lax',
      secure: __prod__
    },
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
    resave: false
  })
);

app.use('/auth', authRouter);
app.use('/folder', folderRouter);
app.use('/note', noteRouter);

// Error handlers
app.use(customErrorHandler);
app.use(celebrateErrorHandler);
app.use(defaultErrorHandler);

export default app;
