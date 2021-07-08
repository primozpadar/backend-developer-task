import argon2 from 'argon2';
import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import { ApiError } from '../handlers/error';

/**
 * USER REGISTER
 * It creates new user in database (password is hashed).
 * Username must be unique. If it's not, it returns error with code 403.
 */
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

/**
 * ### USER LOGIN
 * This handler finds user and verifies his password.
 * If everything is ok, user gets back cookie.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { username, password } = req.body;

  // find user (by username)
  const user = await User.findOne({ where: { username } });
  if (!user) return next(new ApiError(403, 'user does not exist'));

  // validate password
  const isValidPass = await argon2.verify(user.password, password);
  if (!isValidPass) return next(new ApiError(403, 'incorrect password'));

  // set user session
  req.session.user = { id: user.id, username: user.username, name: user.name };
  res.status(200).json({ status: 'success' });
};

/**
 * ### USER LOGOUT
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new ApiError(500, 'logout error'));
    }

    res.clearCookie('NOTES_API_COOKIE', { path: '/' });
    return res.sendStatus(200);
  });
};

/**
 * CHANGE PASSWORD
 * Changes user's password
 */
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

/**
 * AUTHENTICATE USER
 * Middleware checks if user exists.
 * If it doesnt, it returns back error 401.
 */
export const authenticateUser = async (req: Request, _res: Response, next: NextFunction) => {
  const user = req.session.user;

  if (!user) {
    return next(new ApiError(401, 'not authenticated'));
  } else {
    next();
  }
};
