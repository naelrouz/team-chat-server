/* @flow */
import { PubSub, withFilter } from 'graphql-subscriptions';

import formatErrors from '../../../libs/formatErrors';
import requiresAuth from '../../../libs/permissions';

const pubsub = new PubSub();

const NEW_DIRECT_MESSAGE = 'NEW_DIRECT_MESSAGE';

export default {
  DirectMessage: {
    user: ({ user, senderId }, args, { models }) => {
      if (user) {
        return user;
      }
      return models.User.findOne({ where: { id: senderId } }, { raw: true });
    }
  },
  Query: {
    directMessages: requiresAuth.createResolver(
      async (parent, { receiverId, teamId }, { models, ctx: { user } }) => {
        const { Op } = models.Sequelize;
        const directMessages = await models.DirectMessage.findAll(
          {
            ordef: [['createdAt', 'ASC']],
            where: {
              teamId,
              receiverId: {
                [Op.or]: [receiverId, user.id]
              },
              senderId: {
                [Op.or]: [user.id, receiverId]
              }
              //   [Op.and]: [{ receiverId }, { teamId }, { senderId: user.id }],
              //   [Op.or]: []
            }
          },
          { raw: true }
        );

        console.log('directMessages:', directMessages);

        return directMessages;
      }
    )
  },
  Subscription: {
    newDirectMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(NEW_DIRECT_MESSAGE),
        (payload, args) => payload.receiverId === args.receiverId
      )
    }
  },
  Mutation: {
    createDirectMessage: requiresAuth.createResolver(
      async (parent, args, { models, ctx: { user } }) => {
        try {
          //   const message = await models.DirectMessage.create({
          //     ...args,
          //     senderId: user.id
          //   });

          console.log('args: ', args);

          const message = await models.DirectMessage.create({
            ...args,
            senderId: user.id
          });

          const pubsubAsync = async () => {
            const { dataValues } = await models.User.findOne(
              { where: { id: user.id } },
              { raw: true }
            );

            const newDirectMessage = {
              ...message.dataValues,
              user: dataValues
            };

            console.log(
              '>>>>>>>>>> newChannelMessage:::::::::::::::::::',
              newDirectMessage
            );

            pubsub.publish(NEW_DIRECT_MESSAGE, {
              receiverId: args.receiverId,
              newChannelMessage
            });
          };

          pubsubAsync();

          return {
            status: true,
            message
          };
        } catch (err) {
          console.error('createDirectMessage.err: ', err);
          return {
            status: false,
            errors: formatErrors(err, models)
          };
        }
      }
    ),
    addDirectMessagesMember: requiresAuth.createResolver(
      async (parent, { email, teamId }, { models, ctx: { user } }) => {
        try {
          // is member of team?
          const member = await models.Member.findOne(
            { where: { teamId, userId: user.id } },
            { raw: true }
          );

          // console.log('addTeamMember.user.id: ', id);
          console.log('member: ', member);
          // console.log('team.owner !== id: ', team.owner !== id);

          if (!member) {
            return {
              status: false,
              errors: [
                {
                  path: 'user',
                  message: 'Permission denied. You must be member of this Team.'
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
                  path: 'user',
                  message: 'Could not find user with this username or email'
                }
              ]
            };
          }

          console.log('teamId: ', teamId);
          console.log('userId: ', userToAdd.id);

          //   const firstDirectMessageText =
          //     user.id === userToAdd.id
          //       ? `<b>This is your space ${
          //           user.username
          //         }.</b> You can talk to yourself here, but please bear in mind you’ll have to supply both sides of the conversation.`
          //       : `${user.username} added you to the direct message list.`;

          const directMessagesMember = await models.DirectMessage.create({
            senderId: user.id,
            receiverId: userToAdd.id,
            teamId,
            text: `${user.username} added you to the direct message list.`
          });

          console.log('directMessagesMember: ', directMessagesMember);

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
    )
  }
};
