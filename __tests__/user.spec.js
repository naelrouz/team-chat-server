import axios from 'axios';

describe('User resolvers', () => {
  test('allUsers', async () => {
    const response = await axios.post('htttp://localhost:3000/graphql', {
      query: `{
        me {
          id
          username
          teams {
            id
            name
            admin
            directMessagesMembers {
              id
              username
            }
            channels {
              id
              name
              teamId
            }
          }
        }
      }`
    });
  });
});
