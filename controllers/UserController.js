let users = require('../models/users.mjs');
let images = require('../models/image.mjs');
const canvas = require("canvas");
let val = require('../helpers/checkInpFunc.mjs');
let dat = require('../helpers/tempFunc.mjs');
exports.openProfile = async (req,res)=>{
    if(req.session.token){
        let usrID = await users.checkToken(req.session.token,["ID"]);
        if(usrID[0]){
            usrID = usrID[0].dataValues.ID;
            let lan = req.session.lan;
            if (!req.session.lan){lan="EN"}
            let tempData = await dat.getProfileTemplate(usrID,req.session.token,lan);
            res.render('profile/profile', tempData);
        }
    } else {
        res.redirect("/");
    }
}
exports.changeImgUsr = async (req,res)=>{
    if(req.session.token){
        let usrID = await users.checkToken(req.session.token,["ID","name"]);
        if(usrID[0]){
            usrID = usrID[0].dataValues;
            let lan = req.session.lan;
            if (!req.session.lan){lan="EN"}
            let tempData = await dat.getProfileTemplate(usrID.ID,req.session.token,lan);
            let pst = req.body;
            let check = await val.imgUsrValidity(pst.usrName,pst.imgUrl);
            if(check.nameErr==""){
                let usrID = await users.getUserByName(pst.usrName,["ID"]);
                let imgID = await images.getImgByUrl(pst.imgUrl,["ID"]);
                if(usrID[0]&&imgID[0]){
                    usrID = usrID[0].dataValues.ID;
                    imgID = imgID[0].dataValues.ID;
                    await images.toggleImgUser(imgID,usrID);
                }
            } else {
                tempData.nameErr=check.nameErr;
            }
            
            res.redirect('/profile');
        }
    } else {
        res.redirect("/");
    }
}
exports.changeLan = async (req,res)=>{
    if(req.params.language=="lv"){
        req.session.lan = "lv";
        
    } else {
        req.session.lan = "en";
    }
    req.session.save();
}
exports.deleteAcc = async (req,res)=>{
    if(req.session.token){
        let usrID = await users.checkToken(req.session.token,["ID","name"]);
        if(usrID[0]){
            await users.deleteAccount(usrID[0].dataValues.ID);
            req.session.token = "";
            req.session.save();
            res.redirect("/")
        }
    }
}