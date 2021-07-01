import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import app from './app';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' });
}

const main = async () => {
  let retries = 5;
  while (retries) {
    try {
      const connection = await createConnection();
      await connection.runMigrations();
      break;
    } catch (err) {
      retries -= 1;
      console.error(err);
      console.log(`Retries left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5s
    }
  }
  if (retries === 0) {
    throw Error('DATABASE ERROR: Could not connect to database!');
  }

  app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
};

main().catch((err) => console.error(err));
