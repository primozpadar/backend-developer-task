import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import { changePassword, login, logout, register } from '../controller/authController';

const router = express.Router();

/**
 * @openapi
 *components:
 *  securitySchemes:
 *    cookieAuth:
 *      type: apiKey
 *      in: cookie
 *      name: NOTES_API_COOKIE
 *
 * security:
 *    - cookieAuth: []
 */

/**
 * @openapi
 * components:
 *  responses:
 *    AuthError:
 *      description: Cookie is missing or invalid
 *    ValidationError:
 *      description: Invalid body, params or query
 *    Error:
 *      description: Generic error
 *  schemas:
 *    UserLogin:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *        password:
 *          type: string
 *      example:
 *        username: myusername
 *        password: password123
 *    UserChangePassword:
 *      type: object
 *      properties:
 *        username:
 *          type: string
 *        oldPassword:
 *          type: string
 *        newPassword:
 *          type: string
 *      example:
 *        username: myusername
 *        oldPassword: password123
 *        newPassword: password456
 *    UserLoginResponse:
 *      type: object
 *      properties:
 *        status:
 *          type: string
 *    UserRegister:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        username:
 *          type: string
 *        password:
 *          type: string
 *      example:
 *        name: myname
 *        username: myusername
 *        password: password123
 *    Error:
 *      type: object
 *      properties:
 *        status:
 *          type: string
 *        message:
 *          type: string
 */

/**
 * @openapi
 * /auth/register:
 *  post:
 *    summary: Register new user
 *    tags: [Auth]
 *    requestBody:
 *      description: User register data
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserRegister'
 *    responses:
 *      200:
 *        description: Successful user registration
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *      403:
 *        description: Username already taken
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required().max(20),
      username: Joi.string().required().max(20),
      password: Joi.string().required()
    })
  }),
  register
);

/**
 * @openapi
 * /auth/login:
 *  post:
 *    summary: User login
 *    tags: [Auth]
 *    requestBody:
 *      description: User login data
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserLogin'
 *    responses:
 *      200:
 *        description: Successful login
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserLoginResponse'
 *        headers:
 *          Set-Cookie:
 *            schema:
 *              type: string
 *              example: NOTES_API_COOKIE=abcd123; Path=/; HttpOnly
 *      403:
 *        description: Incorrect login credentials
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string().required(),
      password: Joi.string().required()
    })
  }),
  login
);

/**
 * @openapi
 * /auth/logout:
 *  get:
 *    summary: Logout user
 *    tags: [Auth]
 *    responses:
 *      200:
 *        description: Successfull logout
 */
router.get('/logout', logout);

/**
 * @openapi
 * /auth/change-password:
 *  post:
 *    summary: Change user's password
 *    tags: [Auth]
 *    requestBody:
 *      description: User's username, old password and new password.
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UserChangePassword'
 *    responses:
 *      200:
 *        description: Successfully changed password
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *      403:
 *        description: Incorrect user credentials
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.post(
  '/change-password',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      username: Joi.string().required(),
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required()
    })
  }),
  changePassword
);

export default router;
