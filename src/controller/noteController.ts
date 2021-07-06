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

    await queryRunner.commitTransaction();
    return res.json({ note: note! });
  } catch (err) {
    console.error(err);
    await queryRunner.rollbackTransaction();
    return next(new ApiError());
  } finally {
    queryRunner.release();
  }
};

export const getAllNotes = async (_req: Request, res: Response, _next: NextFunction) => {
  const notes = await Note.find();
  return res.json({ notes });
};

export const getNoteById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  // get only note type (to simplify further querying)
  const note = await Note.findOne(id, { select: ['type'] });
  if (!note) return next(new ApiError(404, 'note does not exist'));

  // get db connection and build basic query
  const noteConn = getConnection().getRepository(Note).createQueryBuilder('n').where('n.id = :id', { id });
  let fullNote: Note | undefined;

  // get note with full content
  if (note.type === NoteType.TEXT) {
    fullNote = await noteConn
      .innerJoinAndMapOne('n.content', NoteContentText, 'nc', 'nc."noteId" = n."id"')
      .select(['n.id', 'n.heading', 'n.isShared', 'n.type', 'nc.body'])
      .getOne();
  } else if (note.type === NoteType.LIST) {
    fullNote = await noteConn
      .innerJoinAndMapOne('n.content', NoteContentList, 'nc', 'nc."noteId" = n."id"')
      .select(['n.id', 'n.heading', 'n.isShared', 'n.type', 'nc.items'])
      .getOne();
  }

  if (!fullNote) return next(new ApiError(500));
  return res.json(fullNote);
};
