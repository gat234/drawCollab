const express = require("express");
let users = require('../models/users.mjs');
const router = express.Router();
const reg_controller=require('../controllers/RegisterController.js');
const log_controller=require('../controllers/LoginController.js');
router.get('/',async (req,res)=>{
    let pfpurl = "/images/default/default.png";
    let setusrHeader = ["Log in", "./login"]
    if(req.session.token){
        let name = await users.users_Model.findAll({
            attributes: ["name"],
            where:{
                token:req.session.token
            }
        });
        pfpurl=`/images/userPFP/${name[0].dataValues.name}.png`;
        setusrHeader[0]="Log Out";
        setusrHeader[1]="./logout";
    }
    res.render('index', { 
        title: req.session.token,
        pfpUrl: pfpurl,
        prof_log: setusrHeader[0],
        signUrl: setusrHeader[1]
    });
});
router.get('/login',log_controller.getLoginPage);
router.post('/login',log_controller.checkLogin);
router.get('/register',reg_controller.getRegisterPage);
router.post('/register',reg_controller.Register);
router.get('/logout',log_controller.logOut);
module.exports = router;