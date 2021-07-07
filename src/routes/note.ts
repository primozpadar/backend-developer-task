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

// type: Joi.equal(NoteType.LIST),
// heading: Joi.string().required().max(50),
// items: Joi.array().items(Joi.string()),
// folderId: Joi.number().required()

/**
 * @openapi
 * components:
 *  schemas:
 *    TextNote:
 *      type: object
 *      properties:
 *        type:
 *          type: string
 *          enum:
 *            - TEXT
 *        heading:
 *          type: string
 *        body:
 *          type: string
 *        folderId:
 *          type: number
 *        isShared:
 *          type: boolean
 *    ListNote:
 *      type: object
 *      properties:
 *        type:
 *          type: string
 *          enum:
 *            - LIST
 *        heading:
 *          type: string
 *        items:
 *          type: array
 *          items:
 *            type: string
 *        folderId:
 *          type: number
 *        isShared:
 *          type: boolean
 *    NoteResponse:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        heading:
 *          type: string
 *        isShared:
 *          type: string
 *        type:
 *          type: string
 *        body:
 *          type: string
 *        content:
 *          type: array
 *          items:
 *            type: string
 */

/**
 * GET NOTE BY ID (with content)
 * @openapi
 * /note/{id}:
 *  get:
 *    summary: Get note by ID (authenticated)
 *    tags: [Note]
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        description: Folder ID
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/NoteResponse'
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      404:
 *        $ref: '#/components/responses/Error'
 */
router.get('/:id', celebrate(noteValidationParams), authenticateUserWithoutError, getNoteById);

// from here down, user must be authenticated to be able to modify/get/create notes
router.use(authenticateUser);

/**
 * CREATE NOTE
 * @openapi
 * /note:
 *  post:
 *    summary: Create new note
 *    tags: [Note]
 *    security:
 *      - BearerAuth: []
 *    requestBody:
 *      description: Note data
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            anyOf:
 *              - $ref: '#/components/schemas/TextNote'
 *              - $ref: '#/components/schemas/ListNote'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/NoteResponse'
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      404:
 *        $ref: '#/components/responses/Error'
 */
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
/**
 * GET ALL NOTES
 * @openapi
 * /note:
 *  get:
 *    summary: Get all my notes
 *    tags: [Note]
 *    security:
 *      - BearerAuth: []
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/NoteResponse'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 */
router.get(
  '/',
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      shared: Joi.string().valid('ASC', 'DESC').optional(),
      heading: Joi.string().valid('ASC', 'DESC').optional()
    })
  }),
  getAllNotes
);

/**
 * DELETE NOTE
 * @openapi
 * /note/{id}:
 *  delete:
 *    summary: Delete note by ID
 *    tags: [Note]
 *    security:
 *      - BearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        description: Folder ID
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      200:
 *        description: Success
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      403:
 *        $ref: '#/components/responses/Error'
 */
router.delete('/:id', celebrate(noteValidationParams), deleteNoteById);

/**
 * UPDATE NOTE
 * @openapi
 * /note/{id}:
 *  put:
 *    summary: Update note
 *    tags: [Note]
 *    security:
 *      - BearerAuth: []
 *    requestBody:
 *      description: Note data
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            anyOf:
 *              - $ref: '#/components/schemas/TextNote'
 *              - $ref: '#/components/schemas/ListNote'
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/NoteResponse'
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      404:
 *        $ref: '#/components/responses/Error'
 */
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
