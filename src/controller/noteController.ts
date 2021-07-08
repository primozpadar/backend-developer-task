import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Folder } from '../entity/Folder';
import { Note, NoteType } from '../entity/Note';
import { NoteContentList } from '../entity/NoteContentList';
import { NoteContentText } from '../entity/NoteContentText';
import { ApiError } from '../handlers/error';
import { getSortingOptions } from '../utils/getSortingOptions';

/**
 * ### CREATE NOTE
 * Create new note with content
 * @param {string} req.body.type Note type (TEXT or LIST)
 * @param {string} req.body.heading Note's heading
 * @param {string} req.body.folderId Folder to which note will belong
 * @param {string} req.body.body (optional) note content if type is TEXT
 * @param {string} req.body.items (optional) note content if type is LIST
 */
export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  const { type, heading, folderId } = req.body;
  const userId = req.session.user!.id;

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

/**
 * ### GET ALL NOTES
 * It finds all current user notes.
 * By default it returns 5 notes. This can be overridden with query param *limit*.
 * @param {('ASC' | 'DESC')} req.query.shared (optional) Sort by shared option
 * @param {('ASC' | 'DESC')} req.query.heading (optional) Sort by heading
 * @param {number} req.query.offset (optional) pagination option - default: 0
 * @param {number} req.query.limit (optional) pagination option - default: 5
 */
export const getAllNotes = async (req: Request, res: Response) => {
  const userId = req.session.user!.id;
  const { shared, heading } = getSortingOptions(req);

  // type is checked in middleware
  const offset = parseInt(req.query.offset as string) || 0;
  const limit = parseInt(req.query.limit as string) || 5;

  const notes = await Note.find({
    where: { user: { id: userId } },
    order: { isShared: shared, heading },
    take: limit,
    skip: offset
  });
  return res.json({ notes });
};

/**
 * ### GET NOTE BY ID
 * Returns note (by id) with full data.
 * Allow user to get note if he is owner or allow everyone to get note if it is shared.
 * @param {string} req.params.id Note ID
 */
export const getNoteById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.session.user?.id;

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

/**
 * ### DELETE NOTE BY ID
 * Only user's notes can be deleted
 * @param {string} req.params.id Note ID
 */
export const deleteNoteById = async (req: Request, res: Response, next: NextFunction) => {
  const noteId = req.params.id;
  const userId = req.session.user!.id;
  const result = await Note.delete({ id: parseInt(noteId), user: { id: userId } });

  if (result.affected && result.affected > 0) {
    return res.sendStatus(200);
  }

  return next(new ApiError(403, 'note cant be deleted'));
};

/**
 * ### UPDATE NOTE
 * Change note's data.
 * Type can not be changed.
 * @param {string} req.params.id Note ID
 * @param {string} req.body.heading (optional) Note's heading
 * @param {string} req.body.folderId (optional) Folder to which note will belong
 * @param {string} req.body.isShared (optional) Public or private note
 * @param {string} req.body.body (optional) note content if type is TEXT
 * @param {string} req.body.items (optional) note content if type is LIST
 */
export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  const noteId = req.params.id;
  const userId = req.session.user!.id;
  const note = await Note.findOne({ where: { id: noteId, user: { id: userId } } });
  if (!note) return next(new ApiError(404, 'note does not exist'));

  // update data stored in Node
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
