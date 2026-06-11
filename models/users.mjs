import { sequelize,dataTypes,op } from '../helpers/sequelizeInit.mjs';
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
export async function checkToken(tkn,attr) {
  if(!tkn){return false;}
  let res = await Users.findAll({
    attributes: attr,
      where:{
        token:tkn
      }
  });
  return res;
}
export async function checkEmail(email) {
  let res = await Users.findAll({
    where:{
      email: email
    }
  });
  return res;
}
export async function checkName(name) {
  let res = await Users.findAll({
    where:{
      name: name
    }
  });
  return res;
}
export async function findUser(usrID,attr) {
  let res = await Users.findAll({
    where:{
      ID: usrID
    },
    attributes: attr
  });
  return res;
}
export async function getUserByName(name,attr) {
  let res = await Users.findAll({
      attributes: attr,
      where:{
          [op.or]: [
              {
                  name:name
              },
              {
                  email:name
              }
          ]
      }
  });
  return res;
}
export async function setToken(tkn,id){
  let res = await Users.update(
    {
        token:tkn
    },
    {
        where:{
            ID:id
        }
    }
  );
  return res;
}
export async function setName(nam,id){
  let res = await Users.update(
    {
        name:nam
    },
    {
        where:{
            ID:id
        }
    }
  );
  return res;
}
export async function setPassword(pass,id){
  let res = await Users.update(
    {
        password:pass
    },
    {
        where:{
            ID:id
        }
    }
  );
  return res;
}
export async function createUser(name,pass,email,tkn){
  await Users.create({ 
    name: name, 
    password: pass, 
    email:email,
    token:tkn
  });
}