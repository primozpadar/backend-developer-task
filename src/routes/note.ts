import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import { authenticateUser } from '../controller/authController';
import { createNote, NoteType } from '../controller/noteController';

const router = express.Router();
router.use(authenticateUser);

// create note
router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.alternatives().try(
      Joi.object().keys({
        type: Joi.equal(NoteType.LIST),
        heading: Joi.string().required().max(50),
        items: Joi.array().items(Joi.string()),
        folderId: Joi.number().required()
      }),
      Joi.object().keys({
        type: Joi.equal(NoteType.TEXT),
        heading: Joi.string().required().max(50),
        body: Joi.string().required(),
        folderId: Joi.number().required()
      })
    )
  }),
  createNote
);

export default router;
