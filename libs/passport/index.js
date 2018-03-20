const passport = require('koa-passport');

require('./serialize');

require('./localStrategy');
require('./JWTStrategy');

module.exports = passport;
