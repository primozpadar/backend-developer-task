import express from 'express';
import morgan from 'morgan';
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
