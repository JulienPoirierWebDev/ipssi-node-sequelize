const { Sequelize } = require('sequelize');

const isDev = process.env.ENV === 'DEV';

const DB_url = isDev ? process.env.DB_DEV : process.env.DB_PROD;

const dialect = isDev ? 'mysql' : 'postgres';

const sequelize = new Sequelize(DB_url, {
  dialect,
  protocol: dialect,
  dialectOptions:
    dialect === 'postgres'
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
});
async function connectionToDB() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await sequelize.sync();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

module.exports = { connectionToDB, sequelize };
