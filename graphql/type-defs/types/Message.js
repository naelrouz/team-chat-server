export default `
  type Message {
    id: Int!
    text: String!
    user: User!
    channel: Channel!
    createdAt: String!
  }
  type Query {
    channelMessages(channelId: Int!): [Message!]!
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
