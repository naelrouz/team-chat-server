const passport = require('koa-passport');
const LocalStrategy = require('passport-local');
const User = require('../../models/User');

// Стратегия берёт поля из req.body
// Вызывает для них функцию
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // 'username' by default
      passwordField: 'password',
      session: false
    },
    function(email, password, done) {
      // const user = await models.User.findOne({ where: { email }, raw: true });

      User.findOne({ where: { email }, raw: true }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user || !user.checkPassword(password)) {
          // don't say whether the user exists
          return done(null, false, {
            message: 'Нет такого пользователя или пароль неверен.'
          });
        }

        return done(null, user);
      });
    }
  )
);
