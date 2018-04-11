import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';

export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user } }) => {
        try {
          const { teamId } = args;
          const team = await models.Member.findOne(
            { where: { teamId, userId: user.id } },
            { raw: true }
          );
          if (!team.admin) {
            return {
              status: false,
              errors: [
                {
                  path: 'name',
                  message: 'For this action you have to be owner this Team'
                }
              ]
            };
          }
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
    )
  }
};
