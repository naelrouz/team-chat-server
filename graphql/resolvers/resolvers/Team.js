/* @flow */
import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';

// const a: number = 'wveww';

export default {
  Mutation: {
    addTeamMember: requiresAuth.createResolver(
      async (parent, { email, teamId }, { models, ctx: { user } }) => {
        try {
          const { admin } = await models.Member.findOne(
            { where: { teamId, userId: user.id } },
            { raw: true }
          );

          // console.log('addTeamMember.user.id: ', id);
          console.log('admin: ', admin);
          // console.log('team.owner !== id: ', team.owner !== id);

          if (!admin) {
            return {
              status: false,
              errors: [
                {
                  path: 'email',
                  message: 'Permission denied. You must be owner this Team.'
                }
              ]
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
            teamId,
            admin: false
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
          const { user } = ctx;
          console.log('createTeam.user.id: ', user.id);

          // No transaction
          // const team = await models.Team.create({ ...args, owner: id });
          // console.log('team.id: ', team.id);
          // await models.Channel.create({
          //   name: `General of ${team.name}`,
          //   teamId: team.id
          // });

          // Transaction
          const response = await models.sequelize.transaction(async () => {
            const team = await models.Team.create({ ...args }); // owner: id
            await models.Channel.create({
              name: `General of ${team.name}`,
              public: true,
              teamId: team.id
            });
            const { admin } = await models.Member.create({
              admin: true,
              userId: user.id,
              teamId: team.id
            });

            // console.log('createTeam.transaction.team: ', team);

            return { ...team.dataValues, admin };
          });

          return {
            status: true,
            team: response
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
