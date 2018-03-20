import { Op } from 'sequelize';

// const { Op } = Sequelize;

module.exports = {
  jwtSecret: '7mUYeskJzaUqkPbvuAwr84ZKjmKY9mQD',
  SECRET: '332H3NhmsfSWhVq9JhE42r5ACkjbR3734dCN37EctExprs7He63sYPXsBJfvfdBD',
  SECRET2: 'zcWhK72ckAczsn68Fg3UeCTtU4wjxzDUEWGjRRwk7rKQ6ADP8xjSnDHzRXM5LrKV',
  server: {
    host: '//localhost',
    port: 3000
  },
  postgre: {
    options: {
      dialect: 'postgres',
      operatorsAliases: { $and: Op.and },
      define: {
        underscored: true
      }
    }
  }
};
