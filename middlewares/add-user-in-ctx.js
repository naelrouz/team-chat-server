/*
*  Add payload data from token to the context 
*  Replaces a token if it has expired
*/

import cfg from 'config';
import jwt from 'jsonwebtoken';

import models from '../models';
import { refreshTokens } from '../libs/auth';

const { SECRET, SECRET2 } = cfg;

const addUser = async (ctx, next) => {
  //   ctx.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
  //   ctx.set('x-token', `newToken: ${new Date()}`);
  //   ctx.set('x-refresh-token', `newrefreshToken: ${new Date()}`);

  const token = ctx.request.header['x-token']
    ? ctx.request.header['x-token']
    : '';

  //   const token = false;

  if (token) {
    try {
      const { user } = jwt.verify(token, SECRET);
      ctx.user = user;
    } catch (err) {
      const refreshToken = ctx.request.header['x-refresh-token']
        ? ctx.request.header['x-refresh-token']
        : '';
      const newTokens = await refreshTokens(
        token,
        refreshToken,
        models,
        SECRET,
        SECRET2
      );
      if (newTokens.token && newTokens.refreshToken) {
        ctx.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        ctx.set('x-token', newTokens.token);
        ctx.set('x-refresh-token', newTokens.refreshToken);
      }

      ctx.user = newTokens.user;
    }
  }
  return next();
};

exports.init = app => app.use(addUser);
