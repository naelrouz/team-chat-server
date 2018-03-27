export default `
  type Team {
    id: Int!
    name: String!
    owner: User!
    members: [User!]!
    channels: [Channel!]!
  }
  type CreateTeamResponse {
    status: Boolean!
    team: Team
    errors: [Error!]
  }
  type Query {
    allTeams: [Team!]!
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
