module.exports = {
  server: {
    host: 'http://localhost',
    port: 3003,
  },
  postgre: {
    database: 'fl-test',
    username: 'fl_test',
    password: '123456',
    options: {
      host: 'localhost',
      dialect: 'postgres'
    }
  }
};
