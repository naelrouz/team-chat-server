import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';

export default {
  Query: {
    allTeams: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user: { id } } }) =>
        models.Team.findAll({ owner: id }, { raw: true })
    )
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, ctx }) => {
        try {
          const { user: { id } } = ctx;
          console.log('createTeam.user.id: ', id);

          // ctx.set('lastTeamCreate', args.name);

          await models.Team.create({ ...args, owner: id });
          return {
            status: true
          };
        } catch (err) {
          return {
            status: false,
            errors: formatErrors(err, models)
          };
        }
      }
    )
  },
  Team: {
    channels: ({ id }, args, { models }) =>
      models.Channel.findAll({ teamId: id }, { raw: true })
  }
};
