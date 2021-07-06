import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import { authenticateUser, authenticateUserWithoutError } from '../controller/authController';
import { createNote, deleteNoteById, getAllNotes, getNoteById, updateNote } from '../controller/noteController';
import { NoteType } from '../entity/Note';

const router = express.Router();

// default node params - id
const noteValidationParams = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.number().required()
  })
};

// get note by id (with content)
router.get('/:id', celebrate(noteValidationParams), authenticateUserWithoutError, getNoteById);

// from here down, user must be authenticated to be able to modify/get/create notes
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

// get all notes (without content)
router.get('/', getAllNotes);

router.delete('/:id', celebrate(noteValidationParams), deleteNoteById);

// update note
router.put(
  '/:id',
  celebrate({
    ...noteValidationParams,
    [Segments.BODY]: Joi.alternatives().try(
      Joi.object().keys({
        heading: Joi.string().max(50).optional(),
        items: Joi.array().items(Joi.string()).optional(),
        isShared: Joi.boolean().optional(),
        folderId: Joi.number().optional()
      }),
      Joi.object().keys({
        heading: Joi.string().max(50).optional(),
        body: Joi.string().optional(),
        isShared: Joi.boolean().optional(),
        folderId: Joi.number().optional()
      })
    )
  }),
  updateNote
);

export default router;
