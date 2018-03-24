import formatErrors from '../../../libs/formatErrors';
// import requiresAuth from '../../../libs/permissions';

export default {
  Mutation: {
    createChannel: async (parent, args, { models }) => {
      try {
        const channel = await models.Channel.create(args);

        return {
          status: true,
          channel
        };
      } catch (err) {
        return {
          status: false,
          errors: formatErrors(err, models)
        };
      }
    }
  }
};
