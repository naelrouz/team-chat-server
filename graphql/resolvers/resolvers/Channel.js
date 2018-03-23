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
          ok: true,
          team
        };
      } catch (err) {
        return {
          ok: false,
          errors: formatErrors(err, models)
        };
      }
    }
  }
};
