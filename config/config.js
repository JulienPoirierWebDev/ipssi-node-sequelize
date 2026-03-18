'use strict';

require('dotenv').config();

const isDev = process.env.ENV === 'DEV';
const dialect = isDev ? 'mysql' : 'postgres';
const useEnvVariable = isDev ? 'DB_DEV' : 'DB_PROD';

const sharedConfig = {
  use_env_variable: useEnvVariable,
  dialect,
};

if (dialect === 'postgres') {
  sharedConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

module.exports = {
  development: sharedConfig,
  test: sharedConfig,
  production: sharedConfig,
};
