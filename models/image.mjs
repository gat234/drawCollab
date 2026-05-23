
import { sequelize,dataTypes } from '../helpers/sequelizeInit.mjs';
const Images = sequelize.define(
  'images',
  {
    url: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: dataTypes.STRING,

    },
    description: {
      type: dataTypes.STRING,

    },
    access_type: {
      type: dataTypes.INTEGER,

    },
  },
  {
    timestamps: false
  },
);
export const images_Model = Images;