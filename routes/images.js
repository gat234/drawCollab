const express = require("express");
const router = express.Router();
const image_controller=require('../controllers/ImageController.js');


router.get('/image/:location',image_controller.open);
router.get('/imageView/:location',image_controller.imageView);
router.get('/create',image_controller.creator);
router.post('/create',image_controller.newImage);
router.get('/image/:location/data',image_controller.getData);
module.exports = router;