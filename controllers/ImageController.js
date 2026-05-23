let images = require('../models/image.mjs');
let help = require('../helpers/helpFunc.mjs');
let users = require('../models/users.mjs');
const path = require('path');
exports.lol=async (req,res,next)=>{
  if(req.session.token){
      let name = await users.users_Model.findAll({
          attributes: ["name"],
          where:{
              token:req.session.token
          }
      });
      req.session.name = name[0].dataValues.name;
  }
  res.sendFile(path.join(__dirname, '../public/drawing/index.html'));
  // const img = await images.images_Model.findAll({
  //   where:{
  //     url: req.params.location
  //   }
  // });
  // if(img.length==0){
  //   res.send("Invalid image!");
  // }
  

}
