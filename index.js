import Koa from "koa";
import Router from "koa-router";

import cfg from "config";
import colors from "colors";

import { graphiqlKoa, graphqlKoa } from "apollo-server-koa";
import { makeExecutableSchema } from "graphql-tools";

import middlewares from "./middlewares";
import models from "./models";

import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/type-defs";

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

const endpointURL = "/graphql";
const graphiqlURL = "/graphiql";

const graphqlKoaOptions = { schema, context: { models, user: { id: 1 } } };

router.post(endpointURL, graphqlKoa(graphqlKoaOptions));
router.get(endpointURL, graphqlKoa(graphqlKoaOptions));

router.get(graphiqlURL, graphiqlKoa({ endpointURL })); // interactive in-browser GraphQL IDE

app.use(router.routes());
app.use(router.allowedMethods());

const appListenCB = () => {
  console.log(
    colors.green.bold(
      `Fitlead API start on ${cfg.server.host}:${PORT}${endpointURL}`
    )
  );

  console.log(
    colors.cyan.bold(
      `Graphiql is available on ${cfg.server.host}:${PORT}${graphiqlURL}`
    )
  );
};

models.sequelize
  .sync({ force: false }) // Create the tables
  .then(() => {
    console.log(colors.green("sequelize.sync: OK"));
    app.listen(PORT, appListenCB);
  })
  .catch(err => {
    console.log(err);
  });
