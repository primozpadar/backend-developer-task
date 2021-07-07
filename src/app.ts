import express from 'express';
import morgan from 'morgan';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { celebrateErrorHandler, customErrorHandler, defaultErrorHandler } from './handlers/error';
import authRouter from './routes/auth';
import folderRouter from './routes/folder';
import noteRouter from './routes/note';

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line no-unused-vars
    interface Request {
      user: { id: number; username: string; name: string };
    }
  }
}

const app = express();

if (process.env.NODE_ENV !== 'production') {
  const swaggerDocs = swaggerJsDoc({
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Notes API',
        description: 'Celtra backend task',
        version: '1.0'
      }
    },
    apis: ['./src/routes/**/*']
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/folder', folderRouter);
app.use('/note', noteRouter);

// Error handlers
app.use(customErrorHandler);
app.use(celebrateErrorHandler);
app.use(defaultErrorHandler);

export default app;
