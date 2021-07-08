import argon2 from 'argon2';
import faker from 'faker';
import { User } from '../entity/User';

export type FakeUser = {
  username: string;
  name: string;
  password: string;
};

/**
 * Get fake user data
 * @returns {Object} fake user data
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
