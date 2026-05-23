const express = require("express");
const router = express.Router();
const image_controller=require('../controllers/ImageController.js');

// router.get('/',(_,res)=>{res.send("lol")});
router.get('/:location',image_controller.lol);
module.exports = router;