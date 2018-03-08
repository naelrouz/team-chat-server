// in-memory store by default (use the right module instead)
const session = require('koa-generic-session');
const convert = require('koa-convert');

/*
cookie
id = generateUUID()
cookie['sid'] = id

const state = {
  [id1]: {count: 10},
  [id2]: {count: 4}
};

ctx.session = {count: 10};
*/

exports.init = app => app.use(convert(session({
  cookie: {
    signed: false
  }
})));
