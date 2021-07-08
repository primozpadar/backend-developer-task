import argon2 from 'argon2';
import faker from 'faker';
import supertest from 'supertest';
import app from '../app';
import { Folder } from '../entity/Folder';
import { Note, NoteType } from '../entity/Note';
import { NoteContentList } from '../entity/NoteContentList';
import { NoteContentText } from '../entity/NoteContentText';
import { User } from '../entity/User';

export type FakeUser = {
  username: string;
  name: string;
  password: string;
};

export type FakeFolder = {
  name: string;
};

export type FakeNote = { heading: string; folderId: number } & (
  | {
      type: NoteType.TEXT;
      body: string;
    }
  | {
      type: NoteType.LIST;
      items: string[];
    }
);

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

/**
 * Get fake note data
 * @param {Folder} folder existing folder to which note belongs
 * @param {NoteType} type note type
 * @returns {FakeNote} fake note data
 */
export const fakeNote = (folder: Folder, type: NoteType): FakeNote => {
  if (type === NoteType.LIST) {
    return {
      heading: faker.lorem.words().substring(0, 50),
      folderId: folder.id,
      type: NoteType.LIST,
      items: new Array(Math.floor(Math.random() * 100)).fill(null).map(() => {
        return faker.lorem.words();
      })
    };
  } else {
    return {
      heading: faker.lorem.words().substring(0, 50),
      folderId: folder.id,
      type: NoteType.TEXT,
      body: faker.lorem.paragraph()
    };
  }
};

/**
 * Create fake note in database
 * @param noteData note data
 * @returns {FakeNote} fake note data
 * @returns {User} fake note owner
 */
export const fakeNoteDb = async (noteData: FakeNote, user: User) => {
  const note = await Note.create({
    heading: noteData.heading,
    folder: { id: noteData.folderId },
    type: noteData.type,
    user
  }).save();

  if (noteData.type === NoteType.LIST) {
    await NoteContentList.create({ note, items: noteData.items }).save();
  } else {
    await NoteContentText.create({ note, body: noteData.body }).save();
  }

  return { note };
};
