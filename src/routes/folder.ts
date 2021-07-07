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
 * CREATE FOLDER
 * @openapi
 * /folder:
 *  post:
 *    summary: Create new folder
 *    tags: [Folder]
 *    requestBody:
 *      description: New folder data
 *      required: true
 *      content:
 *        appliaction/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *            example:
 *              name: 'New folder'
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

// get all folders
router.get('/', getMyFolders);

// get folder by id
router.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.number().required()
    })
  }),
  getFolderById
);

// delete folder by id
router.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.number().required()
    })
  }),
  deleteFolderById
);

// update folder name
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
