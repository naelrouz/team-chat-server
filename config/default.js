module.exports = {
  server: {
    host: 'http://localhost',
    port: 3000
  },
  postgre: {
    options: {
      dialect: 'postgres',
      define: {
        underscored: true
      }
    }
  }
};
