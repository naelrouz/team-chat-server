/* @flow */
import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';

export default {
  Message: {
    user: ({ userId }, args, { models }) =>
      models.User.findOne({ where: { id: userId } }, { raw: true })
  },
  Query: {
    channelMessages: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user } }) => {
        const channelMessages = await models.Message.findAll(
          { ordef: [['createdAt', 'ASC']], where: { userId: user.id } },
          { raw: true }
        );

        console.log('channelMessages:', channelMessages);

        return channelMessages;
      }
    )
  },
  Mutation: {
    createMessage: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user } }) => {
        try {
          const message = await models.Message.create({
            ...args,
            userId: user.id
          });
          return {
            status: true,
            message
          };
        } catch (err) {
          console.error('createMessage.err: ', err);
          return {
            status: true,
            errors: formatErrors(err, models)
          };
        }
      }
    )
  }
};
