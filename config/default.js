module.exports = {
  server: {
    host: '//localhost',
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
