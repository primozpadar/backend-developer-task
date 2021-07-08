import supertest from 'supertest';
import { Connection } from 'typeorm';
import app from '../../app';
import { testConn } from '../../test-utils/testConn';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});
afterAll(async () => {
  await conn.close();
});

describe('Auth Router', () => {
  it('Register', async () => {
    const response = await supertest(app)
      .post('/auth/register')
      .send({ username: 'username', name: 'somename', password: 'pass123' })
      .expect(200);
    expect(response.body.status).toBe('success');
  });
});
