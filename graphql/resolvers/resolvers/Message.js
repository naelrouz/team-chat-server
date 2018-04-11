/* @flow */
import { PubSub, withFilter } from 'graphql-subscriptions';

import formatErrors from '../../../libs/formatErrors';
import requiresAuth, { requiresTeamAccess } from '../../../libs/permissions';

const pubsub = new PubSub();

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

export default {
  Message: {
    user: ({ user, userId }, args, { models }) => {
      if (user) {
        return user;
      }
      return models.User.findOne({ where: { id: userId } }, { raw: true });
    }
  },
  Query: {
    channelMessages: requiresAuth.createResolver(
      async (parent, { channelId }, { models, ctx: { user } }) => {
        const channelMessages = await models.Message.findAll(
          { ordef: [['createdAt', 'ASC']], where: { channelId } },
          { raw: true }
        );

        // console.log('>>>>>>>>>> channelMessages:', channelMessages);

        return channelMessages;
      }
    )
  },
  Subscription: {
    newChannelMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
        (payload, args) => payload.channelId === args.channelId
      )
    }
  },
  Mutation: {
    createMessage: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user } }) => {
        try {
          const message = await models.Message.create({
            ...args,
            userId: user.id
          });

          const pubsubAsync = async () => {
            const { dataValues } = await models.User.findOne(
              { where: { id: user.id } },
              { raw: true }
            );

            const newChannelMessage = {
              ...message.dataValues,
              user: dataValues
            };

            console.log(
              '>>>>>>>>>> newChannelMessage:::::::::::::::::::',
              newChannelMessage
            );

            pubsub.publish(NEW_CHANNEL_MESSAGE, {
              channelId: args.channelId,
              newChannelMessage
            });
          };

          pubsubAsync();

          return {
            status: true,
            message
          };
        } catch (err) {
          console.error('createMessage.err: ', err);
          return {
            status: false,
            errors: formatErrors(err, models)
          };
        }
      }
    )
  }
};
