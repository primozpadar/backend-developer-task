import dotenv from 'dotenv';
import app from './app';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' });
}

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
