

const koaBody = require('koa-body');

// ctx.request.body = {}
exports.init = app => app.use(koaBody({
  multipart: true
}));