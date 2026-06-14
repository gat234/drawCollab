import { sequelize,dataTypes,op } from '../helpers/sequelizeInit.mjs';
import {findUser} from './users.mjs'
import {unlink} from 'fs'
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const images_Model = sequelize.define(
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
    width: {
      type: dataTypes.INTEGER,
    },
    height: {
      type: dataTypes.INTEGER,
    },
    visit: {
      type: dataTypes.INTEGER,
    }
  },
  {
    timestamps: false
  },
);
const img_Usr_Model = sequelize.define(
  'img_owners',
  {
    user_ID: {
      type: dataTypes.INTEGER,
      allowNull: false
    },
    img_ID: {
      type: dataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    timestamps: false
  },
);
export async function getImgUsers(imgID,attr){
  let res = await img_Usr_Model.findAll({
    where:{
      img_ID: imgID
    },
    attributes: ["user_ID"]
  });
  
  if(attr.toString()=="name"){
    let nameRes = [];
    for(let i = 0;i<res.length;i++){
      let usrRes = await findUser(res[i].dataValues.user_ID,["name"]);
      if(usrRes[0]){
        nameRes.push(usrRes[0].dataValues.name);
      }
    }
    return nameRes;
  } else {
    return res;
  }
  
}
export async function getImages(userImg){
  let idArr = [];
  for(let i = 0;i<userImg.length;i++){
    let imgID = userImg[i].dataValues.img_ID;
    if(imgID){
      idArr.push(imgID);
    }
  }
  let res = await images_Model.findAll({
    where:{
      ID: idArr
    },
    attributes: ["name","description","url","visit","width","height","access_type","ID"],
  });

  return res;
}
export async function getUsersImg(usrID){
  let res = await img_Usr_Model.findAll({
    where:{
      user_ID: usrID
    },
    attributes: ["img_ID"]
  });
  return res;
}
async function addImgUser(imgID,userID){
  let res = await img_Usr_Model.create({
    img_ID:imgID,
    user_ID:userID
  });
  return res;
}
export async function toggleImgUser(imgID,userID){
  let res;
  let usrImg = await getUsersImg(userID);
  let found = false;
  for(let i=0;i<usrImg.length;i++){
    if(imgID==usrImg[i].dataValues.img_ID){
      found = true;
      break;
    }
  }
  if(found){
    res = await img_Usr_Model.destroy({
      where:{
        [op.and]: [
          {
            img_ID:imgID
          },
          {
            user_ID:userID
          }
        ]
      }
    });
    let checkZero = await getImgUsers(imgID,["ID"]);
    if(!checkZero[0]){
      let imgUrl = await getImgUrlByID(imgID);
      if(imgUrl[0]){
        imgUrl = imgUrl[0].dataValues.url;
        unlink(path.join(__dirname, `../usr_images/${imgUrl}.png`),()=>{});
      }
      await images_Model.destroy({
        where:{
          ID:imgID
        }
      });
    }
  } else {
    res = await addImgUser(imgID,userID);
  }
  
  return res;
}
async function getImgUrlByID(imgID){
  let res = await images_Model.findAll({
    where:{
      ID: imgID
    },
    attributes: ["url"]
  });
  return res;
}
export async function checkImgUser(imgID,userID){
  let res = await img_Usr_Model.findAll({
    attributes: ["ID"],
    where:{
      [op.and]:{
        user_ID:userID,
        img_ID:imgID
      }
    }
  });
  return res;
}
export async function getImgByUrl(url,attr){
  let res = await images_Model.findAll({
    where:{
      url: url
    },
    attributes: attr
  });
  return res;
}
export async function addVisitToImg(imgID,visits){
  await images_Model.update(
    {
      visit:(visits+1)
    },
    {
      where:{
        id:imgID
      }
    }
  );
}

export async function createImage(name,w,h,url,access,usrID){
  let res = await images_Model.create({ 
    name: name, 
    width: w,
    height:h,
    url:url,
    access_type:access
  });
  console.log(res.id,usrID)
  await addImgUser(res.id,usrID);
  return res;
}
export async function getPublicImages(num){
  let res = await images_Model.findAll({
    where:{
      access_type: [0,2]
    },
    attributes: ["name","description","url","visit","width","height","access_type"],
    order:[
      ["visit","DESC"]
    ],
    limit:10,
    offset:num
  });
  return res;
}
export async function getNumPublicImages(){
  let res = await images_Model.count({
    where:{
      access_type: [0,2]
    }
  });
  return res;
}
