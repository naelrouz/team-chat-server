import Koa from 'koa';
import Router from 'koa-router';
import colors from 'colors';

import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';

import middlewares from './middlewares';
// import models from "./models";
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = new Koa();
const router = new Router();

const PORT = 3000;

Object.keys(middlewares).forEach(middleware => {
  middlewares[middleware].init(app);
});

const endpointURL = '/graphql';

router.post(endpointURL, graphqlKoa({ schema }));
router.get(endpointURL, graphqlKoa({ schema }));

router.get('/graphiql', graphiqlKoa({ endpointURL })); // interactive in-browser GraphQL IDE

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(
    colors.green.bold(`Fitlead API start on http://localhost:${PORT}/graphql`)
  );
  console.log(
    colors.cyan.bold(
      `Graphiql is available on http://localhost:${PORT}/graphiql`
    )
  );
});
