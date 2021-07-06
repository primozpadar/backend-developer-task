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

export const getAllNotes = async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user.id;
  const notes = await Note.find({ where: { user: { id: userId } } });
  return res.json({ notes });
};

export const getNoteById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  // get only note type (to simplify further querying)
  const note = await Note.findOne(id, { select: ['type', 'user', 'isShared'], relations: ['user'] });
  if (!note) return next(new ApiError(404, 'note does not exist'));

  // if note is not shared or note is not requested by owner return error
  const isOwner = !!userId && note.user.id === userId;
  if (!isOwner && !note.isShared) {
    return next(new ApiError(401, 'you dont have access to this note'));
  }

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

export const deleteNoteById = async (req: Request, res: Response, next: NextFunction) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const result = await Note.delete({ id: parseInt(noteId), user: { id: userId } });

  if (result.affected && result.affected > 0) {
    return res.sendStatus(200);
  }

  return next(new ApiError(403, 'note cant be deleted'));
};

export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  const noteId = req.params.id;
  const userId = req.user.id;
  const note = await Note.findOne({ where: { id: noteId, user: { id: userId } } });
  if (!note) return next(new ApiError(404, 'note does not exist'));

  // update common data (stored in Node)
  const { heading, isShared, folderId } = req.body;
  if (heading) note.heading = heading;
  if (isShared) note.isShared = isShared;

  // update folder - if folder does not exist return error
  if (folderId) {
    const folder = await Folder.findOne({ where: { id: folderId, user: { id: userId } } });
    if (!folder) return next(new ApiError(400, 'folder does not exist'));
    note.folder = folder;
  }

  // update note content based on type. in case of wrong data type and content return error
  if (note.type === NoteType.LIST && req.body.items) {
    await NoteContentList.update({ note: { id: parseInt(noteId) } }, { items: req.body.items });
  } else if (note.type === NoteType.TEXT && req.body.body) {
    await NoteContentText.update({ note: { id: parseInt(noteId) } }, { body: req.body.body });
  } else if ((note.type === NoteType.LIST && req.body.body) || (note.type === NoteType.TEXT && req.body.items)) {
    return next(new ApiError(403, 'incorrect note data type'));
  }

  await note.save();
  res.json(note);
};
