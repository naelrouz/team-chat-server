export default `
type DirectMessage {
  id: Int!
  text: String!
  user: User!
  senderId: Int!
  receiverId: Int!
  teamId: Int!
  createdAt: String!
}
type Query {
  directMessages(teamId: Int!, receiverId: Int!): [DirectMessage!]!
}
type Subscription {
    newDirectMessage(receiverId: Int!, teamId: Int!): DirectMessage!
    newDirectMessagesMember(teamId: Int!): User!    
}
type CreateDirectMessageResponse {
    status: Boolean!
    message: Message
    errors: [Error!]
}
type AddDirectMessagesMemberResponse {
    status: Boolean!
    member: User
    errors: [Error!]
}
type Mutation {
  createDirectMessage(receiverId: Int!, text: String!, teamId: Int!): CreateDirectMessageResponse!
  addDirectMessagesMember(email: String!, teamId: Int!): AddDirectMessagesMemberResponse!
}
`;
