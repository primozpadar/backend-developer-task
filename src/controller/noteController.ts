import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Folder } from '../entity/Folder';
import { Note, NoteType } from '../entity/Note';
import { NoteContentList } from '../entity/NoteContentList';
import { NoteContentText } from '../entity/NoteContentText';
import { ApiError } from '../handlers/error';

export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  const { type, heading, folderId } = req.body;
  const userId = req.user.id;

  const folder = await Folder.findOne({ where: { id: folderId, user: { id: userId } } });
  if (!folder) return next(new ApiError(400, 'folder does not exist'));

  const queryRunner = getConnection().createQueryRunner();
  try {
    await queryRunner.startTransaction();
    await queryRunner.connect();

    const note = Note.create({ heading, folder, type, user: { id: userId } });
    await queryRunner.manager.save(note);

    let content: NoteContentList | NoteContentText;
    if (type === NoteType.TEXT) {
      const { body } = req.body;
      content = NoteContentText.create({ note, body });
    } else if (type === NoteType.LIST) {
      const { items } = req.body;
      content = NoteContentList.create({ note, items });
    } else {
      return next(new ApiError());
    }
    await queryRunner.manager.save(content);

    return res.json({ note: note! });
  } catch (err) {
    console.error(err);
    await queryRunner.rollbackTransaction();
    return next(new ApiError());
  } finally {
    queryRunner.release();
  }
};
