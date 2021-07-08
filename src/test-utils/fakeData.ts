import argon2 from 'argon2';
import faker from 'faker';
import supertest from 'supertest';
import app from '../app';
import { Folder } from '../entity/Folder';
import { User } from '../entity/User';

export type FakeUser = {
  username: string;
  name: string;
  password: string;
};

export type FakeFolder = {
  name: string;
};

type LoginData = { cookie: string; user: User };

/**
 * Creates fake user, sends request to login route and returns back cookie
 * @returns {LoginData} user and his cookie
 */
export const fakeLogin = async (): Promise<LoginData> => {
  const userData = fakeUser();
  const user = await fakeUserDB(userData);

  const response = await supertest(app)
    .post('/auth/login')
    .send({ username: userData.username, password: userData.password });

  return { cookie: response.header['set-cookie'][0], user };
};

/**
 * Get fake user data
 * @returns {FakeUser} fake user data
 */
export const fakeUser = (): FakeUser => {
  return {
    username: faker.internet.userName().substring(0, 20),
    name: faker.name.findName().substring(0, 20),
    password: faker.internet.password()
  };
};

/**
 * Create fake user in database
 * @param user user data
 * @returns {Object} fake user data
 */
export const fakeUserDB = async (user: FakeUser): Promise<User> => {
  const hash = await argon2.hash(user.password);
  return await User.create({ ...user, password: hash }).save();
};

/**
 * Get fake folder data
 * @returns {FakeFolder} fake folder data
 */
export const fakeFolder = (): FakeFolder => {
  return {
    name: faker.lorem.words().substring(0, 20)
  };
};

/**
 * Create fake folder in database
 * @param folderData folder data
 * @returns {Folder} fake folder data
 * @returns {User} fake folder owner
 */
export const fakeFolderDb = async (folderData: FakeFolder, user: User) => {
  const folder = await Folder.create({ ...folderData, user }).save();
  return { folder, user };
};
