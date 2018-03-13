import bcrypt from 'bcrypt';
import colors from 'colors';

import _ from 'lodash';

const formatErrors = (e, models) => {
  if (e instanceof models.sequelize.ValidationError) {
    //  _.pick({a: 1, b: 2}, 'a') => {a: 1}
    return e.errors.map(x => _.pick(x, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong' }];
};

export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll()
  },
  Mutation: {
    register: async (parent, { password, ...otherArgs }, { models }) => {
      try {
        // if(password)

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await models.User.create({
          ...otherArgs,
          password: hashedPassword
        });
        return {
          status: true,
          user
        };
      } catch (err) {
        console.log(colors.red.bold('register.err: '), err);
        return {
          status: false,
          errors: formatErrors(err, models) // TODO in this array must be all errors. Not only firs.
        };
      }
    }
  }
};
