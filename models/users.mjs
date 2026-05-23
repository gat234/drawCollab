import { sequelize,dataTypes } from '../helpers/sequelizeInit.mjs';
const Users = sequelize.define(
  'users',
  {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: dataTypes.STRING,
    },
    password: {
      type: dataTypes.STRING,
    },
    email: {
      type: dataTypes.STRING,
    },
    token: {
      type: dataTypes.STRING,
    },
    error: {
      type: dataTypes.INTEGER,
    }
  },
  {
    timestamps: false
  },
);
export const users_Model = Users;