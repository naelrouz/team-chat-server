export default `
  type Team {
    id: Int!
    name: String!
    members: [User!]!
    channels: [Channel!]!
  }
  type CreateTeamResponse {
    status: Boolean!
    team: Team
    errors: [Error!]
  }
  type Query {
    userTeams: [Team!]!
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
