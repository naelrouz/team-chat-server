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

          const team = await models.Team.create({ ...args, owner: id });

          console.log('team.id: ', team.id);

          await models.Channel.create({
            name: `General of ${team.name}`,
            teamId: team.id
          });

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
    )
  },
  Team: {
    channels: ({ id }, args, { models }) =>
      models.Channel.findAll({ where: { teamId: id } }, { raw: true })
  }
};
