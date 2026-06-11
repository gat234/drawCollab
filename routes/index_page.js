const express = require("express");
const index_controller=require('../controllers/IndexController.js');
const router = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
router.get('/',index_controller.getIndex);
router.get('/settings',index_controller.settings);
router.post('/settings/upload/pfp',upload.single("file"),index_controller.postPFP);
router.post('/settings',index_controller.changeAccount);
module.exports = router;