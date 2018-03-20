import colors from 'colors';

import { tryLogin } from '../../../libs/auth';
import formatErrors from '../../../libs/formatErrors';

export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll()
  },
  Mutation: {
    register: async (parent, args, { models, ctx }) => {
      try {
        console.log('ctx: ', ctx);

        // const hashedPassword = await bcrypt.hash(password, 12);
        const user = await models.User.create(args);
        return {
          status: true,
          user
        };
      } catch (err) {
        console.log(colors.red.bold('register.err: '), err);
        return {
          status: false,
          errors: formatErrors(err) // TODO in this array must be all errors. Not only firs.
        };
      }
    },
    login: (parent, { email, password }, { models, SECRET, SECRET2 }) =>
      tryLogin(email, password, models, SECRET, SECRET2)

    // login: async (parent, { password, ...otherArgs }, { models, ctx }) => {
    //   try {

    // if (ctx.state.user) {
    //   const payload = {
    //     id: ctx.state.user._id,
    //     displayName: ctx.state.user.displayName
    //   };
    //   const token = jwt.encode(payload, config.jwtSecret);
    //   ctx.body = {token};
    // } else {
    //   ctx.status = 400;
    //   ctx.body = {error: "Invalid credentials"};
    // }
    //   } catch (err) {}
    // }
  }
};
