import bcrypt from 'bcrypt';
import colors from 'colors';

export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll()
  },
  Mutation: {
    // register: (parent, args, { models }) => {
    //   bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     models.User.create(args);
    //   });
    // }
    register: async (parent, { password, ...otherArgs }, { models }) => {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = models.User.create({
        ...otherArgs,
        password: hashedPassword
      });
      user.catch(err => {
        console.log(colors.red.bold('register.err: '), err);
      });
      return user;

      //   try {
      //     const hashedPassword = await bcrypt.hash(password, 12);
      //     const user = await models.User.create({
      //       ...otherArgs,
      //       password: hashedPassword
      //     });
      //     return true;
      //   } catch (err) {
      //     console.log(colors.red.bold('register.err: '), err);
      //     return false;
      //   }
    }
  }
};
