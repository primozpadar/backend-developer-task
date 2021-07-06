import { NextFunction, Request, Response } from 'express';
import { Folder } from '../entity/Folder';
import { NoteList } from '../entity/NoteList';
import { NoteText } from '../entity/NoteText';
import { ApiError } from '../handlers/error';

export enum NoteType {
  LIST = 'LIST',
  TEXT = 'TEXT'
}

export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  const { type, heading, folderId } = req.body;
  const userId = req.user.id;

  const folder = await Folder.findOne({ where: { id: folderId, user: { id: userId } } });
  if (!folder) return next(new ApiError(400, 'folder does not exist'));

  let note: NoteList | NoteText;

  if (type === NoteType.TEXT) {
    const { body } = req.body;
    note = NoteText.create({ heading, body, folder, user: { id: userId } });
  } else if (type === NoteType.LIST) {
    const { items } = req.body;
    note = NoteList.create({ heading, items, folder, user: { id: userId } });
  } else {
    return next(new ApiError());
  }

  await note.save();
  res.json({ note: note! });
};
