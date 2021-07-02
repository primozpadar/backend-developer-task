import argon2 from 'argon2';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import { ApiError } from '../handlers/error';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, username, password } = req.body;
  const hash = await argon2.hash(password);

  try {
    const user = await User.create({ name, username, password: hash });
    await user.save();
  } catch (error) {
    if (error.message.includes('duplicate key value')) return next(new ApiError(403, 'username already taken'));
    else return next(new ApiError(500, 'unknown error'));
  }

  return res.json({ status: 'success' });
};

export const login = (_req: Request, res: Response) => {
  res.sendStatus(200);
};

export const changePassword = (_req: Request, res: Response) => {
  res.sendStatus(200);
};
