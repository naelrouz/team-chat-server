export default `
  type Message {
    id: Int!
    text: String!
    user: User!
    channelId: Int!
    channel: Channel!
    createdAt: String!
  }
  type Query {
    channelMessages(channelId: Int!): [Message!]!
  }
  type Subscription {
    newChannelMessage(channelId: Int!): Message!
  }
  type CreateMessageResponse {
    status: Boolean!
    message: Message
    errors: [Error!]
  }
  type Mutation {
    createMessage(channelId: Int!, text: String!): CreateMessageResponse!
  }
`;
