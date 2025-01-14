import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Folder } from '../entity/Folder';
import { Note } from '../entity/Note';
import { ApiError } from '../handlers/error';
import { getSortingOptions } from '../utils/getSortingOptions';

/**
 * ### CREATE FOLDER
 * Creates user's folder.
 * @param {string} req.body.name New folder name
 */
export const createFolder = async (req: Request, res: Response) => {
  const { name } = req.body;
  const id = req.session.user!.id;
  const folder = await Folder.create({ name, user: { id } }).save();

  res.json({ id: folder.id, name: folder.name });
};

/**
 * ### GET MY FOLDERS
 * Find all folders for current user.
 */
export const getMyFolders = async (req: Request, res: Response) => {
  const id = req.session.user!.id;
  const folders = await Folder.find({ where: { user: { id } } });

  res.json(folders);
};

/**
 * ### GET FOLDER BY ID
 * Find folder with given ID which belongs to current user.
 * If folder exists and current user is not its owner, it returns 404 error.
 * @param {number} req.params.id Folder's ID
 * @param {('ASC' | 'DESC')} req.query.shared (optional) Sort by shared option
 * @param {('ASC' | 'DESC')} req.query.heading (optional) Sort by heading
 * @param {number} req.query.offset (optional) pagination option - default: 0
 * @param {number} req.query.limit (optional) pagination option - default: 5
 */
export const getFolderById = async (req: Request, res: Response, next: NextFunction) => {
  const folderId = req.params.id;
  const userId = req.session.user!.id;
  const { shared, heading } = getSortingOptions(req);

  // type is checked in middleware
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;

  const folderQuery = getConnection()
    .getRepository(Folder)
    .createQueryBuilder('f')
    .leftJoinAndMapMany('f.notes', Note, 'n', 'n.folderId = f.id')
    .where('f.id = :folderId AND f.userId = :userId', { folderId, userId })
    .addOrderBy('n.heading', heading || undefined)
    .offset(offset)
    .limit(limit);

  if (shared) folderQuery.addOrderBy('n.isShared', shared);
  if (heading) folderQuery.addOrderBy('n.heading', heading);

  const folder = await folderQuery.getOne();
  if (!folder) return next(new ApiError(404, 'folder does not exist'));
  res.json(folder);
};

/**
 * ### DELETE FOLDER BY ID
 * Deletes folder only if it belongs to current user.
 * In case there is no folder that can be deleted, return 403 error.
 * @param {number} req.params.id Folder's ID
 */
export const deleteFolderById = async (req: Request, res: Response, next: NextFunction) => {
  const folderId = req.params.id;
  const userId = req.session.user!.id;
  const result = await Folder.delete({ id: parseInt(folderId), user: { id: userId } });

  if (result.affected && result.affected > 0) {
    return res.sendStatus(200);
  }

  return next(new ApiError(403, 'folder cant be deleted'));
};

/**
 * ### UPDATE FOLDER
 * Update folder's properties (name).
 * Folder can be updated only by owner.
 * @param {number} req.params.id Folder's ID
 * @param {number} req.body.name New name
 */
export const updateFolder = async (req: Request, res: Response, next: NextFunction) => {
  const newName = req.body.name;

  const folderId = req.params.id;
  const userId = req.session.user!.id;
  const result = await Folder.update({ id: parseInt(folderId), user: { id: userId } }, { name: newName });

  if (result.affected && result.affected > 0) {
    return res.sendStatus(200);
  }

  return next(new ApiError(403, 'folder cant be updated'));
};
