import Koa from 'koa';
import Router from 'koa-router';

import jwt from 'jsonwebtoken';
import cfg from 'config';
import colors from 'colors';
// import { createServer } from 'http';

import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { refreshTokens } from './libs/auth';

import middlewares from './middlewares';
import addUserInContext from './middlewares/add-user-in-ctx';
import models from './models';

import resolvers from './graphql/resolvers';
import typeDefs from './graphql/type-defs';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const app = new Koa();
const router = new Router();

const PORT = 3000;

const { SECRET, SECRET2 } = cfg;

console.log('SECRET: ', SECRET);

Object.keys(middlewares).forEach(middleware => {
  middlewares[middleware].init(app);
});

addUserInContext.init(app);

const endpointURL = '/graphql';
const graphiqlURL = '/graphiql';
const subscriptionsEndpoint = `ws://localhost:${PORT}/subscriptions`;

const graphqlKoaOptions = ctx => ({
  schema,
  context: {
    models,
    ctx,
    SECRET,
    SECRET2
  }
});

router.post(endpointURL, graphqlKoa(graphqlKoaOptions));
router.get(endpointURL, graphqlKoa(graphqlKoaOptions));

router.get(graphiqlURL, graphiqlKoa({ endpointURL, subscriptionsEndpoint })); // interactive in-browser GraphQL IDE

app.use(router.routes());
app.use(router.allowedMethods());

const afterAppStart = () => {
  console.log(
    colors.green.bold(
      `Team Chat API start on ${cfg.server.host}:${PORT}${endpointURL}`
    )
  );

  console.log(
    colors.cyan.bold(
      `Graphiql is available on ${cfg.server.host}:${PORT}${graphiqlURL}`
    )
  );
};

// models.sequelize
//   .sync({ force: false }) // Create the tables
//   .then(() => {
//     console.log(colors.green('sequelize.sync: OK'));
//     app.listen(PORT, afterAppStart);
//   })
//   .catch(err => {
//     console.log(err);
//   });

const appStart = async () => {
  try {
    await models.sequelize.sync({ force: false }); // Create the tables
    console.log(colors.green('sequelize.sync: OK'));

    const server = await app.listen(PORT);
    await new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
        onConnect: async (connectionParams, webSocket) => {
          // return { user: { id: 1 } };
          console.log('connectionParams: ', connectionParams);
          const { token, refreshToken } = connectionParams;

          if (token && refreshToken) {
            try {
              const { user } = jwt.verify(token, SECRET);
              return { user };
            } catch (err) {
              const newTokens = await refreshTokens(
                token,
                refreshToken,
                models,
                SECRET,
                SECRET2
              );
              if (newTokens.token && newTokens.refreshToken) {
                return { user: newTokens.user };
              }

              //   if (!user) {
              //     throw new Error('Invalid auth tokens!');
              //   }
            }

            return {
              errors: [
                {
                  message: 'Invalid auth tokens!',
                  path: 'SubscriptionServer.onConnect'
                }
              ]
            };
          }

          return {
            errors: [
              {
                message: 'Missing auth tokens!',
                path: 'SubscriptionServer.onConnect'
              }
            ]
          };
        }
      },
      {
        server,
        path: '/subscriptions'
      }
    );
    afterAppStart();
  } catch (err) {
    console.error('appStart.err:', err);
  }
};

appStart();
