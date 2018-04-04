/* @flow */
import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';

// const a: number = 'wveww';

export default {
  Query: {
    userTeams: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user: { id } } }) => {
        const teamsWhereOwner = await models.Team.findAll(
          { where: { owner: id } },
          { raw: true }
        );
        // const teamsWhereMember = await models.sequelize.query(
        //   'select * from Teams join members on id = team_id where user_id = ?',
        //   {
        //     replacements: [id],
        //     model: models.Team
        //   }
        // );
        const teamsWhereMember = await models.Team.findAll(
          {
            include: [
              {
                model: models.User,
                where: { id }
              }
            ]
          },
          { raw: true }
        );
        const allTeams = [...teamsWhereOwner, ...teamsWhereMember];
        return allTeams;
      }
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

          // console.log('addTeamMember.user.id: ', id);
          // console.log('team.owner: ', team.owner);
          // console.log('team.owner !== id: ', team.owner !== id);

          if (team.owner !== id) {
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
            await models.Member.create({
              admin: true,
              userId: user.id,
              teamId: team.id
            });
            return team;
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
