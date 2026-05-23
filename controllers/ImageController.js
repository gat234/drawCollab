let images = require('../models/image.mjs');

const path = require('path');
exports.lol=async (req,res,next)=>{

  // res.sendFile(path.join(__dirname, '../index.html'));
  const img = await images.images_Model.findAll({
    where:{
      url: req.params.location
    }
  });
  if(img.length==0){
    res.send("Invalid image!");
  }
  

}
