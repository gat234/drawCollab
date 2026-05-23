let images = require('../models/image.mjs');
let help = require('../helpers/helpFunc.mjs');
const path = require('path');
exports.lol=async (req,res,next)=>{
  // help.createPfp("haha");
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
