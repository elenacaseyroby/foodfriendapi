require('dotenv').config();

module.exports = {
  development: {
    DB_URL: process.env.DB_URL_DEV,
  },
  test: {
    DB_URL: process.env.DB_URL_TEST,
  },
  production: {
    DB_URL: process.env.DB_URL_PROD,
  },
};
