import { createConnection } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();
export const testConn = (drop: boolean = false) => {
  return createConnection({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    database: `${process.env.DATABASE_NAME}_test`,
    port: parseInt(process.env.DATABASE_PORT!),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    synchronize: drop,
    dropSchema: drop,
    entities: ['src/entity/**/*.ts'],
    migrations: ['src/migration/**/*.ts'],
    subscribers: ['src/subscriber/**/*.ts'],
    cli: { entitiesDir: 'src/entity', migrationsDir: 'src/migration', subscribersDir: 'src/subscriber' }
  });
};
