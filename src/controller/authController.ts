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
  const isValidPass = await argon2.verify(user.password, password);
  if (!isValidPass) return next(new ApiError(403, 'incorrect password'));

  // create and send auth token (expires in 24h)
  const authToken = jwt.sign({ id: user.id, username: user.username, name: user.name }, process.env.AUTH_KEY!, {
    expiresIn: '24h'
  });
  res.json({ status: 'success', authToken });
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { username, oldPassword, newPassword } = req.body;

  // find user (by username)
  const user = await User.findOne({ where: { username } });
  if (!user) return next(new ApiError(403, 'user does not exist'));

  // validate password
  const isValidPass = await argon2.verify(user.password, oldPassword);
  if (!isValidPass) return next(new ApiError(403, 'incorrect password'));

  // hash new password and update user in database
  const hash = await argon2.hash(newPassword);
  user.password = hash;
  await user.save();

  return res.json({ status: 'success' });
};

function getToken(req: Request) {
  const authHeader = req.headers.authorization;
  return authHeader?.split(' ')[1];
}

export const authenticateUser = async (req: Request, _res: Response, next: NextFunction) => {
  const token = getToken(req);
  if (!token) return next(new ApiError(401, 'token missing'));

  jwt.verify(token, process.env.AUTH_KEY!, (err, user) => {
    if (err) return next(new ApiError(403, 'invalid token'));
    // @ts-ignore
    req.user = { ...user, id: parseInt(user.id) };
    next();
  });
};

export const authenticateUserWithoutError = async (req: Request, _res: Response, next: NextFunction) => {
  const token = getToken(req);
  if (!token) return next();

  jwt.verify(token, process.env.AUTH_KEY!, (err, user) => {
    if (err) return next(new ApiError(403, 'invalid token'));
    // @ts-ignore
    req.user = { ...user, id: parseInt(user.id) };
    next();
  });
};
