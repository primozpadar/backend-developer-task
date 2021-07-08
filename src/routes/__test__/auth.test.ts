import supertest from 'supertest';
import { Connection } from 'typeorm';
import app from '../../app';
import { User } from '../../entity/User';
import { fakeUser, fakeUserDB } from '../../test-utils/fakeData';
import { testConn } from '../../test-utils/testConn';
import faker from 'faker';
import { authenticateUser } from '../../controller/authController';
import { ApiError } from '../../handlers/error';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});
afterAll(async () => {
  await conn.close();
});

describe('Auth Router', () => {
  it('register new user', async () => {
    const user = fakeUser();
    const response = await supertest(app).post('/auth/register').send(user).expect(200);

    expect(response.body.status).toBe('success');

    // user should be in database
    const dbUser = await User.findOne({ where: { username: user.username, name: user.name } });
    expect(dbUser).toMatchObject({
      username: user.username,
      name: user.name
    });
  });

  it('prevents to register user with duplicate username', async () => {
    // create user in database
    const user = fakeUser();
    await User.create(user).save(); // password is not hashed but it doesnt matter in this case

    // try to register user with the same data
    const response = await supertest(app).post('/auth/register').send(user).expect(403);

    expect(response.body).toMatchObject({
      status: 'error',
      message: 'username already taken'
    });
  });

  it('login user and get back cookie', async () => {
    const userData = fakeUser();
    await fakeUserDB(userData);

    const response = await supertest(app)
      .post('/auth/login')
      .send({ username: userData.username, password: userData.password })
      .expect(200);

    const cookieRegex = /^NOTES_API_COOKIE=.*/;
    expect(response.header['set-cookie'][0]).toMatch(cookieRegex);
    expect(response.body.status).toEqual('success');
  });

  it('prevents user to login with invalid credentials', async () => {
    const userData = fakeUser();
    await fakeUserDB(userData);

    // invalid password
    const response1 = await supertest(app)
      .post('/auth/login')
      .send({ username: userData.username, password: faker.internet.password() })
      .expect(403);

    expect(response1.body.status).toEqual('error');
    expect(response1.body.message).toEqual('incorrect password');

    // invalid username
    const response2 = await supertest(app)
      .post('/auth/login')
      .send({ username: faker.internet.userName(), password: faker.internet.password() })
      .expect(403);

    expect(response2.body.status).toEqual('error');
    expect(response2.body.message).toEqual('user does not exist');
  });

  it('logouts user', async () => {
    const userData = fakeUser();
    await fakeUserDB(userData);

    const loginResponse = await supertest(app)
      .post('/auth/login')
      .send({ username: userData.username, password: userData.password });

    const cookie = loginResponse.header['set-cookie'][0];
    const response = await supertest(app).get('/auth/logout').set('Cookie', cookie).expect(200);

    const expCookieRegex = /^NOTES_API_COOKIE=.*Expires=Thu, 01 Jan 1970 00:00:00 GMT/;
    expect(response.header['set-cookie'][0]).toMatch(expCookieRegex);
  });

  it('change user password', async () => {
    const userData = fakeUser();
    await fakeUserDB(userData);

    const response = await supertest(app)
      .post('/auth/change-password')
      .send({
        username: userData.username,
        oldPassword: userData.password,
        newPassword: faker.internet.password()
      })
      .expect(200);

    expect(response.body.status).toBe('success');
  });

  it('prevents to change password to non-existing user', async () => {
    const response = await supertest(app)
      .post('/auth/change-password')
      .send({
        username: faker.internet.userName(),
        oldPassword: faker.internet.password(),
        newPassword: faker.internet.password()
      })
      .expect(403);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('user does not exist');
  });

  it('prevents to change user password if old password is incorrect', async () => {
    const userData = fakeUser();
    await fakeUserDB(userData);

    const response = await supertest(app)
      .post('/auth/change-password')
      .send({
        username: userData.username,
        oldPassword: faker.internet.password(),
        newPassword: faker.internet.password()
      })
      .expect(403);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('incorrect password');
  });
});

describe('Auth Middleware', () => {
  it('should call next if user is authenticated', async () => {
    const req = {
      session: {
        user: {
          id: faker.datatype.number(),
          name: faker.name.findName(),
          username: faker.internet.userName()
        }
      }
    };
    const next = jest.fn();

    // @ts-ignore
    authenticateUser(req, {}, next);

    expect(next).toBeCalledWith();
  });

  it('should throw error if user session doesnt exist', async () => {
    const req = {
      session: {
        user: undefined
      }
    };
    const next = jest.fn();

    // @ts-ignore
    authenticateUser(req, {}, next);

    expect(next).toHaveBeenCalledWith(new ApiError(401, 'not authenticated'));
  });
});
