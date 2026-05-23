import { Sequelize,DataTypes } from '@sequelize/core';
import { MySqlDialect } from '@sequelize/mysql';


export const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: 'ImgCollab',
  user: 'imgUsr',
  password: 'free',
  host: 'localhost',
  port: 3306
});
export const dataTypes = DataTypes;