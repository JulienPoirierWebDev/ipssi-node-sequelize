const { Sequelize } = require('sequelize');

const sequelize = new Sequelize("mysql://root@localhost:3306/sequelize_characters")



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
