const { DataTypes } = require("sequelize")
const { sequelize} = require("../db")

const Character = sequelize.define(
  'Character',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey:true,
      autoIncrement:true
    },
    description: {
      type: DataTypes.STRING,
      allowNull:false
    },
    name: {
      type: DataTypes.STRING,
      unique:true,
      allowNull:false,
      validate: {
        notEmpty: true,
      }
    },
    createdAt: {
      type:DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull:false
    },
    updatedAt: {
      type:DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull:false
    }
  }
)

module.exports = Character;
