import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import { changePassword, login, register } from '../controller/authController';

const router = express.Router();

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
