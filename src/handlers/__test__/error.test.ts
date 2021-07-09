import { celebrate, Segments, Joi } from 'celebrate';
import express from 'express';
import faker from 'faker';
import supertest from 'supertest';
import { Connection } from 'typeorm';
import { testConn } from '../../test-utils/testConn';
import { ApiError, celebrateErrorHandler, customErrorHandler, defaultErrorHandler } from '../error';

let conn: Connection;
beforeAll(async () => {
  conn = await testConn();
});
afterAll(async () => {
  await conn.close();
});

describe('Error handlers', () => {
  it('Handles custom error', async () => {
    const errMessage = faker.lorem.words();
    const errStatus = faker.helpers.shuffle([300, 400, 401, 404, 500, 505])[0];

    const app = express();
    app.use((_req, _res, next) => next(new ApiError(errStatus, errMessage)));
    app.use(customErrorHandler);
    const response = await supertest(app).get('/').expect(errStatus);

    expect(response.body).toMatchObject({
      status: 'error',
      message: errMessage
    });
  });

  it('Handles custom error without details', async () => {
    const app = express();
    app.use((_req, _res, next) => next(new ApiError()));
    app.use(customErrorHandler);
    const response = await supertest(app).get('/').expect(500);

    expect(response.body).toMatchObject({
      status: 'error',
      message: 'unknown error'
    });
  });

  it('Handles celebrate validation error', async () => {
    const app = express();

    app.use(
      celebrate({
        [Segments.PARAMS]: Joi.object().keys({
          invalidKey: Joi.number().required()
        })
      })
    );
    app.use(celebrateErrorHandler);
    const response = await supertest(app).get('/').expect(400);

    expect(response.body).toMatchObject({
      status: 'error',
      message: 'validation error',
      errors: expect.arrayContaining(['"invalidKey" is required'])
    });
  });

  it('Handles generic error', async () => {
    const app = express();

    app.use(() => {
      throw Error();
    });

    // make sure none of other handlers respond to generic error
    app.use(customErrorHandler);
    app.use(celebrateErrorHandler);

    app.use(defaultErrorHandler);
    const response = await supertest(app).get('/').expect(500);

    expect(response.body).toMatchObject({
      status: 'error',
      message: 'unknown error'
    });
  });
});
