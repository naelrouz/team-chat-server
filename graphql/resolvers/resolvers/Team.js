/* @flow */
import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';

// const a: number = 'wveww';

export default {
  Query: {
    teamMembers: requiresAuth.createResolver(
      async (parent, { teamId }, { models }) => {
        // return models.Member.findAll({ where: {} });

        // const teamMembers = await models.User.findAll(
        //   {
        //     include: [
        //       {
        //         model: models.Teams,
        //         where: { id: teamId },
        //         raw: true
        //       }
        //     ]
        //   },
        //   { raw: true }
        // );

        const teamMembers = await models.sequelize.query(
          'SELECT * FROM "Users" JOIN "members" ON "members"."user_id" = "Users"."id" WHERE "members"."team_id" = ?',
          {
            replacements: [teamId],
            model: models.User,
            raw: true
          }
        );

        return teamMembers;
      }
    )
  },
  Mutation: {
    addTeamMember: requiresAuth.createResolver(
      async (parent, { email, teamId }, { models, ctx: { user } }) => {
        try {
          //  Permission to adding ?
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
          // User is isset ?
          const addedUser = await models.User.findOne(
            { where: { email } },
            { raw: true }
          );

          console.log('userToAdd:', !addedUser);

          if (!addedUser) {
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

          // Added user is already a member of this group ?

          const teamMember = await models.Member.findOne(
            { where: { teamId, userId: addedUser.id } },
            { raw: true }
          );

          if (teamMember) {
            return {
              status: false,
              errors: [
                {
                  path: 'email',
                  message: 'User is already a member of this group'
                }
              ]
            };
          }

          console.log('teamId: ', teamId);
          console.log('userId: ', addedUser.id);

          const member = await models.Member.create({
            userId: addedUser.id,
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
          const response = await models.sequelize.transaction(
            async transaction => {
              const team = await models.Team.create(
                { ...args },
                { transaction }
              ); // owner: id
              //
              await models.Channel.create(
                {
                  name: `General of ${team.name}`,
                  public: true,
                  teamId: team.id
                },
                { transaction }
              );
              //
              const { admin } = await models.Member.create(
                {
                  admin: true,
                  userId: user.id,
                  teamId: team.id
                },
                { transaction }
              );

              // console.log('createTeam.transaction.team: ', team);

              return { ...team.dataValues, admin };
            }
          );

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
      models.Channel.findAll({ where: { teamId: id } }, { raw: true }),
    directMessagesMembers: ({ id }, args, { models, ctx: { user } }) =>
      models.sequelize.query(
        'select distinct on (u.id) u.id, u.username from "Users" as u join direct_messages as dm on (u.id = dm.sender_id) or (u.id = dm.receiver_id) where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id) and dm.team_id = :teamId',
        {
          replacements: { currentUserId: user.id, teamId: id },
          model: models.User,
          raw: true
        }
      )
  }
};
