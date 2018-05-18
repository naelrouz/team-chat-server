import colors from 'colors';

import { tryLogin } from '../../../libs/auth';
import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';

export default {
  User: {
    teams: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user } }) => {
        // const teamsWhereOwner = await models.Team.findAll(
        //   { where: { owner: id } },
        //   { raw: true }
        // );
        // const teamsWhereMember = await models.sequelize.query(
        //   'select * from Teams join members on id = team_id where user_id = ?',
        //   {
        //     replacements: [id],
        //     model: models.Team
        //   }
        // );
        // const teamsWhereMember = await models.Team.findAll(
        //     {
        //         include: [
        //             {
        //                 model: models.User,
        //                 where: {id},
        //                 raw: true
        //             }
        //         ]
        //     },
        //     {raw: true}
        // );

        const teamsWhereMember = await models.sequelize.query(
          'SELECT "Team"."id", "Team"."name", "Team"."created_at", "Team"."updated_at", "Users"."id" AS "Users.id", "Users"."username" AS "Users.username", "Users"."email" AS "Users.email", "Users"."password" AS "Users.password", "Users"."created_at" AS "Users.created_at", "Users"."updated_at" AS "Users.updated_at", "Users->member"."admin" AS "admin", "Users->member"."created_at" AS "Users.member.created_at", "Users->member"."updated_at" AS "Users.member.updated_at", "Users->member"."user_id" AS "Users.member.userId", "Users->member"."team_id" AS "Users.member.teamId" FROM "Teams" AS "Team" INNER JOIN ( "members" AS "Users->member" INNER JOIN "Users" AS "Users" ON "Users"."id" = "Users->member"."user_id") ON "Team"."id" = "Users->member"."team_id" AND "Users"."id" = ?',
          {
            replacements: [user.id],
            model: models.Team,
            raw: true
          }
        );

        // ...teamsWhereOwner,
        console.log('teamsWhereMember: ', teamsWhereMember);

        const userTeams = [...teamsWhereMember];
        return userTeams;
      }
    )
  },
  Query: {
    // TODO fix first load after login

    me: requiresAuth.createResolver((parent, args, { models, ctx }) => {
      console.log('Query.me.ctx: ', ctx);

      const { user } = ctx;

      return models.User.findOne({ where: { id: user.id } });
    }),
    allUsers: (parent, args, { models }) => models.User.findAll()
  },
  Mutation: {
    register: async (parent, args, { models, ctx }) => {
      try {
        console.log('ctx: ', ctx);

        // const hashedPassword = await bcrypt.hash(password, 12);
        const user = await models.User.create(args);
        return {
          status: true,
          user
        };
      } catch (err) {
        console.log(colors.red.bold('register.err: '), err);
        return {
          status: false,
          errors: formatErrors(err) // TODO in this array must be all errors. Not only firs.
        };
      }
    },
    login: (parent, { email, password }, { models, ctx, SECRET, SECRET2 }) =>
      tryLogin(email, password, models, SECRET, SECRET2, ctx)

    // login: async (parent, { password, ...otherArgs }, { models, ctx }) => {
    //   try {

    // if (ctx.state.user) {
    //   const payload = {
    //     id: ctx.state.user._id,
    //     displayName: ctx.state.user.displayName
    //   };
    //   const token = jwt.encode(payload, config.jwtSecret);
    //   ctx.body = {token};
    // } else {
    //   ctx.status = 400;
    //   ctx.body = {error: "Invalid credentials"};
    // }
    //   } catch (err) {}
    // }
  }
};
