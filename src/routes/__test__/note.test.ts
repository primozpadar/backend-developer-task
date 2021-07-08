import supertest from 'supertest';
import { Connection } from 'typeorm';
import app from '../../app';
import { Folder } from '../../entity/Folder';
import { Note, NoteType } from '../../entity/Note';
import { NoteContentList } from '../../entity/NoteContentList';
import { NoteContentText } from '../../entity/NoteContentText';
import {
  fakeFolder,
  fakeFolderDb,
  fakeLogin,
  fakeNote,
  fakeNoteDb,
  fakeUser,
  fakeUserDB
} from '../../test-utils/fakeData';
import { testConn } from '../../test-utils/testConn';
import faker from 'faker';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});
afterAll(async () => {
  await conn.close();
});

const noteTypesArr = [NoteType.LIST, NoteType.TEXT];

describe('Note route', () => {
  it.each(noteTypesArr)('create note of type %s', async (noteType) => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const note = fakeNote(folder, noteType);

    const response = await supertest(app).post('/note').set('Cookie', cookie).send(note).expect(200);

    const baseNote = {
      heading: note.heading,
      isShared: false,
      user: { id: user.id },
      folder: { id: folder.id, name: folder.name }
    };

    if (noteType === NoteType.LIST) {
      // LIST NOTE
      expect(response.body.note).toMatchObject({
        ...baseNote,
        type: NoteType.LIST
      });
    } else {
      // TEXT NOTE
      expect(response.body.note).toMatchObject({
        ...baseNote,
        type: NoteType.TEXT
      });
    }
  });

  it('prevents unauthorized user to create note', async () => {
    await supertest(app).post('/note').expect(401);
  });

  it('prevents to create note within invalid folder', async () => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const note = fakeNote(folder, NoteType.TEXT);

    await Folder.delete({ id: folder.id }); // delete folder
    const response = await supertest(app).post('/note').set('Cookie', cookie).send(note).expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('folder does not exist');
  });

  it('get all notes', async () => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);

    // one note of each type
    const notes = await Promise.all([
      fakeNoteDb(fakeNote(folder, NoteType.TEXT), user),
      fakeNoteDb(fakeNote(folder, NoteType.LIST), user)
    ]);

    const response = await supertest(app).get('/note').set('Cookie', cookie).expect(200);

    expect(response.body.notes).toEqual(
      expect.arrayContaining(
        notes.map(({ note }) => {
          return expect.objectContaining({
            id: note.id,
            heading: note.heading,
            isShared: note.isShared,
            type: note.type
          });
        })
      )
    );
  });

  it.todo('get all notes (with pagination)');
  it.todo('get all notes (with sorting options)');

  it.each(noteTypesArr)('get note by id of type %s (with content)', async (noteType) => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const noteData = fakeNote(folder, noteType);
    const { note } = await fakeNoteDb(noteData, user);

    const response = await supertest(app).get(`/note/${note.id}`).set('Cookie', cookie).expect(200);

    const baseNote = {
      id: note.id,
      heading: note.heading,
      isShared: note.isShared,
      type: note.type
    };

    if (noteData.type === NoteType.LIST) {
      expect(response.body).toMatchObject({ ...baseNote, content: { items: noteData.items } });
    } else {
      expect(response.body).toMatchObject({ ...baseNote, content: { body: noteData.body } });
    }
  });

  it.each(noteTypesArr)('allow everyone to get note (type %s) if it is public', async () => {
    const user = await fakeUserDB(fakeUser());
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const noteData = fakeNote(folder, NoteType.TEXT);
    const { note } = await fakeNoteDb(noteData, user);

    // make note public
    await Note.update({ id: note.id }, { isShared: true });

    const response = await supertest(app).get(`/note/${note.id}`).expect(200);

    const baseNote = {
      id: note.id,
      heading: note.heading,
      isShared: true,
      type: note.type
    };

    if (noteData.type === NoteType.LIST) {
      expect(response.body).toMatchObject({ ...baseNote, content: { items: noteData.items } });
    } else {
      expect(response.body).toMatchObject({ ...baseNote, content: { body: noteData.body } });
    }
  });

  it('prevents to get note by id that does not exist', async () => {
    const invalidId = faker.datatype.number();
    await Note.delete({ id: invalidId });

    const response = await supertest(app).get(`/note/${invalidId}`).expect(404);
    expect(response.body).toMatchObject({
      status: 'error',
      message: 'note does not exist'
    });
  });

  it('prevents to get note if its not public and owned by user', async () => {
    const user = await fakeUserDB(fakeUser());
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const noteData = fakeNote(folder, NoteType.TEXT);
    const { note } = await fakeNoteDb(noteData, user);

    const response = await supertest(app).get(`/note/${note.id}`).expect(401);
    expect(response.body).toMatchObject({
      status: 'error',
      message: 'you dont have access to this note'
    });
  });

  it.each(noteTypesArr)('deletes note of type %s', async (noteType) => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const noteData = fakeNote(folder, noteType);
    const { note } = await fakeNoteDb(noteData, user);

    await supertest(app).delete(`/note/${note.id}`).set('Cookie', cookie).expect(200);

    // check if note exists
    const noteDb = await Note.findOne(note.id);
    expect(noteDb).toBeUndefined();

    // check if note data was also deleted
    if (noteType === NoteType.LIST) {
      const noteContentDb = await NoteContentList.findOne({ where: { note: { id: note.id } } });
      expect(noteContentDb).toBeUndefined();
    } else {
      const noteContentDb = await NoteContentText.findOne({ where: { note: { id: note.id } } });
      expect(noteContentDb).toBeUndefined();
    }
  });

  it('prevents to delete note other than mine', async () => {
    const { cookie } = await fakeLogin(); // user 1
    const { user } = await fakeLogin(); // user 2
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const noteData = fakeNote(folder, NoteType.TEXT);
    const { note } = await fakeNoteDb(noteData, user);

    await supertest(app).delete(`/note/${note.id}`).set('Cookie', cookie).expect(403);

    // check if note exists
    const noteDb = await Note.findOne(note.id);
    expect(noteDb).not.toBeUndefined();
  });

  it.each(noteTypesArr)('updates note', async (noteType) => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const noteData = fakeNote(folder, noteType);
    const { note } = await fakeNoteDb(noteData, user);

    const { folder: newFolder } = await fakeFolderDb(fakeFolder(), user);
    const newNote = fakeNote(folder, noteType);
    const newNoteData: any = { heading: newNote.heading, folderId: newFolder.id };
    if (newNote.type === NoteType.LIST) {
      newNoteData.items = newNote.items;
    } else {
      newNoteData.body = newNote.body;
    }

    const response = await supertest(app)
      .put(`/note/${note.id}`)
      .send({ ...newNoteData, isShared: true })
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body).toMatchObject({
      id: note.id,
      heading: newNoteData.heading,
      type: noteType,
      isShared: true,
      folder: {
        id: newFolder.id
      }
    });
  });

  it('prevents to update note with new invalid folder', async () => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const noteData = fakeNote(folder, NoteType.TEXT);
    const { note } = await fakeNoteDb(noteData, user);

    const invalidId = faker.datatype.number();
    await Folder.delete({ id: invalidId });

    const response = await supertest(app)
      .put(`/note/${note.id}`)
      .send({ folderId: invalidId })
      .set('Cookie', cookie)
      .expect(400);

    expect(response.body).toMatchObject({
      status: 'error',
      message: 'folder does not exist'
    });
  });

  it('prevents to update folder if it does not exist', async () => {
    const { cookie } = await fakeLogin();
    const invalidId = faker.datatype.number();
    await Note.delete({ id: invalidId });

    const response = await supertest(app)
      .put(`/note/${invalidId}`)
      .send({ isShared: true })
      .set('Cookie', cookie)
      .expect(404);

    expect(response.body).toMatchObject({
      status: 'error',
      message: 'note does not exist'
    });
  });
});
