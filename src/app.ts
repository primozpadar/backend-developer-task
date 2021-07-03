import express from 'express';
import morgan from 'morgan';
import { customErrorHandler, defaultErrorHandler } from './handlers/error';
import authRouter from './routes/auth';

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line no-unused-vars
    interface Request {
      user?: { username: string; name: string };
    }
  }
}

const app = express();

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', authRouter);

// Error handlers
app.use(customErrorHandler);
app.use(defaultErrorHandler);

export default app;
