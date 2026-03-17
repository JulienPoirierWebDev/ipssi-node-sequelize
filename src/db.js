const { Sequelize } = require('sequelize');

const DB_url = process.env.ENV === "DEV" ? process.env.DB_DEV : process.env.DB_PROD

const sequelize = new Sequelize(DB_url)



async function connectionToDB() {
try {
  await sequelize.authenticate();
  console.log('Connection has been established successfully.');

  await sequelize.sync();


} catch (error) {
  console.error('Unable to connect to the database:', error);
}
}




module.exports = {connectionToDB, sequelize};
