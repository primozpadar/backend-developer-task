import { celebrate, Joi, Segments } from 'celebrate';
import express from 'express';
import { authenticateUser } from '../controller/authController';
import {
  createFolder,
  deleteFolderById,
  getFolderById,
  getMyFolders,
  updateFolder
} from '../controller/folderController';

const router = express.Router();
router.use(authenticateUser);

/**
 * @openapi
 * components:
 *  schemas:
 *    FolderName:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *      example:
 *        name: foldername
 *    Folder:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        name:
 *          type: string
 *    FolderWithNotes:
 *      type: object
 *      properties:
 *        id:
 *          type: number
 *        name:
 *          type: string
 *        notes:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Note'
 */

/**
 * CREATE FOLDER
 * @openapi
 * /folder:
 *  post:
 *    summary: Create new folder
 *    tags: [Folder]
 *    security:
 *      - BearerAuth: []
 *    requestBody:
 *      description: New folder data
 *      required: true
 *      content:
 *        appliaction/json:
 *          schema:
 *            $ref: '#/components/schemas/FolderName'
 *    responses:
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      200:
 *        description: Successfully created new folder
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Folder'
 */
router.post(
  '/',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required().max(20)
    })
  }),
  createFolder
);

/**
 * GET ALL (MY) FOLDERS
 * @openapi
 * /folder:
 *  get:
 *    summary: Get all folders
 *    description: It returns all folders for current user
 *    tags: [Folder]
 *    security:
 *      - BearerAuth: []
 *    responses:
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Folder'
 */
router.get('/', getMyFolders);

/**
 * GET FOLDER BY ID
 * @openapi
 * /folder/{id}:
 *  get:
 *    summary: Get folder by ID
 *    description: It returns folder for given id.
 *    tags: [Folder]
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
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FolderWithNotes'
 */
router.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.number().required()
    })
  }),
  getFolderById
);

/**
 * DELETE FOLDER BY ID
 * @openapi
 * /folder/{id}:
 *  delete:
 *    summary: Delete folder by ID
 *    tags: [Folder]
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
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      403:
 *        $ref: '#/components/responses/Error'
 *      200:
 *        description: Success
 */
router.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.number().required()
    })
  }),
  deleteFolderById
);

/**
 * UPDATE FOLDER
 * @openapi
 * /folder/{id}:
 *  put:
 *    summary: Update folder's name
 *    tags: [Folder]
 *    security:
 *      - BearerAuth: []
 *    requestBody:
 *      description: New folder data
 *      required: true
 *      content:
 *        appliaction/json:
 *          schema:
 *            $ref: '#/components/schemas/FolderName'
 *    parameters:
 *      - in: path
 *        name: id
 *        description: Folder ID
 *        required: true
 *        schema:
 *          type: integer
 *    responses:
 *      400:
 *        $ref: '#/components/responses/ValidationError'
 *      401:
 *        $ref: '#/components/responses/AuthError'
 *      403:
 *        $ref: '#/components/responses/Error'
 *      200:
 *        description: Success
 */
router.put(
  '/:id',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required().max(20)
    }),
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.number().required()
    })
  }),
  updateFolder
);

export default router;
