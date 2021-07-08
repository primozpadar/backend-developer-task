import supertest from 'supertest';
import { Connection } from 'typeorm';
import app from '../../app';
import { Folder } from '../../entity/Folder';
import { fakeFolder, fakeFolderDb, fakeLogin } from '../../test-utils/fakeData';
import { testConn } from '../../test-utils/testConn';
import faker from 'faker';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});
afterAll(async () => {
  await conn.close();
});

describe('Folder route', () => {
  it('creates folder', async () => {
    const folder = fakeFolder();
    const { cookie } = await fakeLogin();
    const response = await supertest(app).post('/folder').set('Cookie', cookie).send(folder).expect(200);

    expect(typeof response.body.id).toBe('number');
    expect(response.body.name).toBe(folder.name);

    // expect folder to be in database
    const folderDb = await Folder.findOne(response.body.id);
    expect(folderDb).toMatchObject({
      id: response.body.id,
      name: folder.name
    });
  });

  it('prevents unauthorized user to create folder', async () => {
    const folder = fakeFolder();
    await supertest(app).post('/folder').send(folder).expect(401);
  });

  it('gets all folders', async () => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const response = await supertest(app).get('/folder').set('Cookie', cookie).expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: folder.id,
          name: folder.name
        })
      ])
    );
  });

  it('gets folder by id (with notes)', async () => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const response = await supertest(app).get(`/folder/${folder.id}`).set('Cookie', cookie).expect(200);

    expect(Array.isArray(response.body.notes)).toBe(true);
    expect(response.body).toMatchObject({
      id: folder.id,
      name: folder.name
    });
    // TODO - also check if any notes exist in array (after creating them)
  });

  it('returns err 404 if folder does not exist', async () => {
    const { cookie } = await fakeLogin();
    const folderId = faker.datatype.number();

    await Folder.delete({ id: folderId }); // just to make sure folder does not exist
    const response = await supertest(app).get(`/folder/${folderId}`).set('Cookie', cookie).expect(404);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('folder does not exist');
  });

  it.todo('gets folder by id (with notes) sorted');
  it.todo('gets folder by id (with notes) pagination');

  it('deletes folder', async () => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    await supertest(app).delete(`/folder/${folder.id}`).set('Cookie', cookie).expect(200);

    // expect folder to not be in db anymore
    const folderDb = await Folder.findOne(folder.id);
    expect(folderDb).toBeUndefined();
  });

  it('prevents to delete other folder than mine', async () => {
    const { cookie } = await fakeLogin(); // user 1
    const { user } = await fakeLogin(); // user 2
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const response = await supertest(app).delete(`/folder/${folder.id}`).set('Cookie', cookie).expect(403);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('folder cant be deleted');

    // expect folder to still be in database
    const folderDb = await Folder.findOne(folder.id);
    expect(folderDb).not.toBeUndefined();
  });

  it('updates folder', async () => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const newName = faker.lorem.words().substring(0, 20);

    await supertest(app).put(`/folder/${folder.id}`).set('Cookie', cookie).send({ name: newName }).expect(200);

    const dbFolder = await Folder.findOne(folder.id);
    expect(dbFolder).toMatchObject({
      name: newName
    });
  });

  it('prevents to update folder other than mine', async () => {
    const { cookie } = await fakeLogin(); // user 1
    const { user } = await fakeLogin(); // user 2
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const newName = faker.lorem.words().substring(0, 20);

    const response = await supertest(app)
      .put(`/folder/${folder.id}`)
      .set('Cookie', cookie)
      .send({ name: newName })
      .expect(403);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('folder cant be updated');

    // expect name not to be changed
    const dbFolder = await Folder.findOne(folder.id);
    expect(dbFolder).toMatchObject({ name: folder.name });
  });

  it('prevents to update folder with invalid body', async () => {
    const { cookie, user } = await fakeLogin();
    const { folder } = await fakeFolderDb(fakeFolder(), user);
    const newName = faker.lorem.sentence(); // too long name

    const response = await supertest(app)
      .put(`/folder/${folder.id}`)
      .set('Cookie', cookie)
      .send({ name: newName })
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('validation error');

    // expect name not to be changed
    const dbFolder = await Folder.findOne(folder.id);
    expect(dbFolder).toMatchObject({ name: folder.name });
  });
});
