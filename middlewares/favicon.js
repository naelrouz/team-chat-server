
// Usually served by Nginx
const favicon = require('koa-favicon');

exports.init = app => app.use(favicon());

/*
  app.use((ctx, next) => {
    if (ctx.url !== '/favicon.ico') return next();

    ctx.body = fs.readFileSync('favicon.ico');
  })
*/

/*
  async function a() {}

  function a() {
    return new Promise();
  }
*/

// 
// app._middlwares = [];
//
// app._middlwares[0]()
//   .then(() => {})
