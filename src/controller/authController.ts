import argon2 from 'argon2';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entity/User';
import { ApiError } from '../handlers/error';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, username, password } = req.body;

  try {
    // create new user (with hashed password)
    const hash = await argon2.hash(password);
    const user = await User.create({ name, username, password: hash });
    await user.save();
  } catch (error) {
    // username duplicated error
    if (error.message.includes('duplicate key value')) return next(new ApiError(403, 'username already taken'));
    else return next(new ApiError(500, 'unknown error'));
  }

  return res.json({ status: 'success' });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // find user (by username)
  const user = await User.findOne({ where: { username } });
  if (!user) return next(new ApiError(403, 'user does not exist'));

  // validate password
  const isValidPass = argon2.verify(user.password, password);
  if (!isValidPass) return next(new ApiError(403, 'incorrect password'));

  // create and send auth token (expires in 24h)
  const authToken = jwt.sign({ username: user.username, name: user.name }, process.env.AUTH_KEY!, { expiresIn: '24h' });
  res.json({ status: 'success', authToken });
};

export const changePassword = (_req: Request, res: Response) => {
  res.sendStatus(200);
};
