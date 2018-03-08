// import fs from 'fs';
// import path from 'path';
import colors from "colors";
import Sequelize from "sequelize";
import cfg from "config";

// import { colog } from '../libs/helprs';

// const env = process.env.NODE_ENV;
// var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];

const sequelize = new Sequelize(
  cfg.postgre.database,
  cfg.postgre.username,
  cfg.postgre.password,
  cfg.postgre.options
);

// const sequelize = new Sequelize('nael', 'nael', '', {
//   host: 'localhost',
//   dialect: 'postgres'
// });

sequelize
  .authenticate()
  .then(() => {
    // colog('green', `Connection has been established successfully.`);
  })
  .catch(err => {
    console.log(colors.red.bold("Unable to connect to the database:", err));
  });

// sequelize
//   .sync() // create the database table for our model(s)
//   // .then(function(){
//   //   // do some work
//   // })
//   .then(function(){
//     return sequelize.drop() // drop all tables in the db
//   });

// const db = {};

// fs
//   .readdirSync(__dirname)
//   .filter(
//     file =>
//       file.indexOf('.') !== 0 && file.indexOf('_') !== 0 && file !== 'index.js'
//   )
//   .forEach(file => {
//     const model = sequelize.import(path.join(__dirname, file));
//     db[model.name] = model;
//   });

const db = {
  user: sequelize.import("./user")
};

console.log("models.db: ", db);

Object.keys(db).forEach(modelName => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
