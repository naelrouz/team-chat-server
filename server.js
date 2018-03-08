import Koa from 'koa';
import Router from 'koa-router';
import cfg from 'config';
import colors from 'colors';
// import _ from 'underscore';
// import koaBody from 'koa-bodyparser';
import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import { execute, subscribe } from 'graphql';
// import DataLoader from "dataloader";
// import { SubscriptionServer } from "subscriptions-transport-ws";

import middlewares from './middlewares';
// import models from "./models";
import typeDefs from './graphql/schema';
import resolvers from './graphql/resolvers';
// import passport from './libs/passport';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// const SECRET = cfg.secret;

const app = new Koa();
const router = new Router();

Object.keys(middlewares).forEach(middleware => {
  middlewares[middleware].init(app);
});

// app.use(passport.initialize());

router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' })); // interactive in-browser GraphQL IDE

// const batchSuggestion = async (keys, { Suggestion }) => {
//   const suggestion = await Suggestion.findAll({
//     raw: true,
//     where: {
//       boardId: { $in: keys }
//     }
//   });
//   console.log("suggestion", suggestion);
//   const suggestionGroupBy = _.groupBy(suggestion, "boardId");
//   console.log("suggestion", suggestionGroupBy);
//   return keys.map(key => suggestionGroupBy[key] || []);
// };

router.post(
  '/graphql',
  graphqlKoa(ctx => ({
    schema
    // context: {
    //   models,
    // SECRET,
    // ctx
    // suggestionLoader: new DataLoader(keys => batchSuggestion(keys, models))
    // }
  }))
);

app.use(router.routes());

export default app;
