const koa2Cors = require('koa2-cors');

// ctx.request.body = {}
exports.init = app => app.use(koa2Cors());