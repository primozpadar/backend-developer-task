const dir = process.env.NODE_ENV === 'development' ? 'src' : 'build';
const extension = process.env.NODE_ENV === 'development' ? 'ts' : 'js';

module.exports = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  // synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [`${dir}/entity/**/*.${extension}`],
  migrations: [`${dir}/migration/**/*.${extension}`],
  subscribers: [`${dir}/subscriber/**/*.${extension}`],
  cli: { entitiesDir: `${dir}/entity`, migrationsDir: `${dir}/migration`, subscribersDir: `${dir}/subscriber` }
};
