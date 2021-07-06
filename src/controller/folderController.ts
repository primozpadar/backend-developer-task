import { NextFunction, Request, Response } from 'express';
import { Folder } from '../entity/Folder';
import { ApiError } from '../handlers/error';

export const createFolder = async (req: Request, res: Response) => {
  const { name } = req.body;
  const id = req.user.id;
  const folder = await Folder.create({ name, user: { id } }).save();

  res.json({ id: folder.id, name: folder.name });
};

export const getMyFolders = async (req: Request, res: Response) => {
  const id = req.user.id;
  const folders = await Folder.find({ where: { user: { id } } });

  res.json(folders);
};

export const getFolderById = async (req: Request, res: Response, next: NextFunction) => {
  const folderId = req.params.id;
  const userId = req.user.id;
  const folder = await Folder.findOne({ where: { id: folderId, user: { id: userId } } });

  if (!folder) return next(new ApiError(404, 'folder does not exist'));

  res.json(folder);
};

export const deleteFolderById = async (req: Request, res: Response, next: NextFunction) => {
  const folderId = req.params.id;
  const userId = req.user.id;
  const result = await Folder.delete({ id: parseInt(folderId), user: { id: userId } });

  if (result.affected && result.affected > 0) {
    return res.sendStatus(200);
  }

  return next(new ApiError(403, 'folder cant be deleted'));
};

export const updateFolder = async (req: Request, res: Response, next: NextFunction) => {
  const newName = req.body.name;

  const folderId = req.params.id;
  const userId = req.user.id;
  const result = await Folder.update({ id: parseInt(folderId), user: { id: userId } }, { name: newName });

  if (result.affected && result.affected > 0) {
    return res.sendStatus(200);
  }

  return next(new ApiError(403, 'folder cant be updated'));
};
