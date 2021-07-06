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

// create folder
router.post('/', createFolder);

// get all folders
router.get('/', getMyFolders);

// get folder by id
router.get('/:id', getFolderById);

// delete folder by id
router.delete('/:id', deleteFolderById);

// update folder name
router.put('/:id', updateFolder);

export default router;
