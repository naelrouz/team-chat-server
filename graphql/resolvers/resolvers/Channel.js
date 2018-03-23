import formatErrors from '../../../libs/formatErrors';
// import requiresAuth from '../../../libs/permissions';

export default {
  Mutation: {
    createChannel: async (parent, args, { models }) => {
      try {
        await models.Channel.create(args);

        const team = await models.Team.find(
          { where: { id: args.teamId } },
          { raw: true }
        );

        return {
          status: true,
          team
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
