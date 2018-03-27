import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';
import Message from '../../../models/Message';

export default {
  Query: {
    allTeams: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user: { id } } }) =>
        models.Team.findAll({ owner: id }, { raw: true })
    )
  },
  Mutation: {
    addTeamMember: requiresAuth.createResolver(
      async (parent, { email, teamId }, { models, ctx: { user: { id } } }) => {
        try {
          const team = await models.Team.findOne(
            { where: { id: teamId } },
            { raw: true }
          );

          console.log('addTeamMember.user.id: ', id);
          console.log('team.owner: ', team.owner);

          console.log('team.owner !== id: ', team.owner !== id);

          if (team.owner !== id) {
            return {
              status: false,
              errors: [{ path: 'email', message: 'Нет прав' }]
            };
          }

          const userToAdd = await models.User.findOne(
            { where: { email } },
            { raw: true }
          );

          console.log('userToAdd:', !userToAdd);

          if (!userToAdd) {
            return {
              status: false,
              errors: [
                {
                  path: 'email',
                  message: 'Could not find user with this email'
                }
              ]
            };
          }

          console.log('teamId: ', teamId);
          console.log('userId: ', userToAdd.id);

          const member = await models.Member.create({
            userId: userToAdd.id,
            teamId
          });

          console.log('member: ', member);

          return {
            status: true
          };
        } catch (err) {
          console.log('addTeamMember.err:', err);

          return {
            status: false,
            errors: formatErrors(err, models)
          };
        }
      }
    ),

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
