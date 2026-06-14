const express = require("express");
const router = express.Router();
const reg_controller=require('../controllers/RegisterController.js');
const log_controller=require('../controllers/LoginController.js');
const pro_controller=require('../controllers/UserController.js');
router.get('/login',log_controller.getLoginPage);
router.post('/login',log_controller.checkLogin);
router.get('/register',reg_controller.getRegisterPage);
router.post('/register',reg_controller.Register);
router.get('/logout',log_controller.logOut);
router.get('/profile',pro_controller.openProfile);
router.post('/changeImgUsr',pro_controller.changeImgUsr);
router.post('/lan/:language',pro_controller.changeLan);
router.post('/deleteAccount',pro_controller.deleteAcc);

module.exports = router;