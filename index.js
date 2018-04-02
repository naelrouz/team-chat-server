import Koa from 'koa';
import Router from 'koa-router';

import cfg from 'config';
import colors from 'colors';
// import { createServer } from 'http';

import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

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

router.get(graphiqlURL, graphiqlKoa({ endpointURL })); // interactive in-browser GraphQL IDE

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

// const server = createServer(app);

// const serverStart = () => {
//   server.listen(PORT, () => {
//     new SubscriptionServer(
//       {
//         execute,
//         subscribe,
//         schema
//       },
//       {
//         server,
//         path: '/subscriptions'
//       }
//     );
//   });
// };

// const start = async () => {
//   try {
//     await models.sequelize.sync({ force: false }); // Create the tables
//     console.log(colors.green('sequelize.sync: OK'));

//     await serverStart();
//     afterAppStart();
//   } catch (err) {
//     console.error(colors.red.bold(`App start err: ${err}`));
//   }
// };

// start();

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
    const subscriptionServer = await new SubscriptionServer(
      {
        execute,
        subscribe,
        schema
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

// server.listen(3001, () => {
//   new SubscriptionServer(
//     {
//       execute,
//       subscribe,
//       schema
//     },
//     {
//       server: server,
//       path: '/subscriptions'
//     }
//   );
// });
