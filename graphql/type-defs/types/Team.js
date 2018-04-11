export default `
  type Team {
    id: Int!
    name: String!
    members: [User!]!
    directMessagesMembers: [User!]!
    channels: [Channel!]!
    admin: Boolean!
  }
  type Query {
    teamMembers(teamId: Int!): [User!]!
  }
  type CreateTeamResponse {
    status: Boolean!
    team: Team
    errors: [Error!]
  }
  type AddTeamMemberResponse {
    status: Boolean!
    errors: [Error!]
  }
  type Mutation {
    createTeam(name: String!): CreateTeamResponse!
    addTeamMember(email: String!, teamId: Int!): AddTeamMemberResponse!
  }
`;
