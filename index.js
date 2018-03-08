import Koa from 'koa';
import Router from 'koa-router';

import colors from 'colors';
import path from 'path';

import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeTypes } from 'merge-graphql-schemas';

import middlewares from './middlewares';
import models from './models';

import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';

const typesArray = fileLoader(path.join(__dirname, './graphql/schema'));

const typeDefs = mergeTypes(typesArray, { all: true });

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
const graphiqlURL = '/graphiql';

router.post(endpointURL, graphqlKoa({ schema }));
router.get(endpointURL, graphqlKoa({ schema }));

router.get(graphiqlURL, graphiqlKoa({ endpointURL })); // interactive in-browser GraphQL IDE

app.use(router.routes());
app.use(router.allowedMethods());

const appListenCB = () => {
  console.log(
    colors.green.bold(
      `Fitlead API start on http://localhost:${PORT}/${endpointURL}`
    )
  );
  console.log(
    colors.cyan.bold(
      `Graphiql is available on http://localhost:${PORT}/${graphiqlURL}`
    )
  );
};

models.sequelize
  .sync({ force: true }) // Create the tables
  .then(() => {
    console.log(colors.green('sequelize.sync: OK'));
    app.listen(PORT, appListenCB);
  })
  .catch(err => {
    console.log(err);
  });
