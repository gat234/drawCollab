let users = require('../models/users.mjs');
let images = require('../models/image.mjs');
const canvas = require("canvas");
const path = require('path');
const fs = require('fs');
let help = require('../helpers/helpFunc.mjs');



exports.getIndex = async (req,res)=>{
    const img = await images.getPublicImages();
    
    let tempData = await help.prepareHeader(req.session.token);
    tempData.publImg = await help.getImgData(img);
    console.log(tempData)
    res.render('index', tempData);
};
exports.settings = async (req,res)=>{
    if(req.session.token){
        let name = await users.checkToken(req.session.token,["name"]);
        if(!name[0]){
            res.redirect("/");
            return;
        }
    } else {
        res.redirect("/");
        return;
    }
    let tempData = await help.prepareHeader(req.session.token);
    res.render('settings', tempData);
}
exports.postPFP = async (req,res)=>{
    
    if(req.session.token){
        let name = await users.checkToken(req.session.token,["name"]);
        if(name[0]){
            let c = canvas.createCanvas(100,100);
            let ctx = c.getContext('2d');
            let fPath = path.join(__dirname, "../",req.file.destination,req.file.originalname);
            let moved = false;
            fs.rename(path.join(__dirname, "../", req.file.path),fPath,() => {moved=true;})
            while(!moved){
                await help.sleep(40);
            }
            try{
                await canvas.loadImage(fPath)
                .then((img)=>{
                    ctx.drawImage(img,img.width/-2,img.height/-2);
                })
            } catch {
                res.redirect("/");
            }
            const buffer = c.toBuffer("image/png");
                
            fs.writeFileSync(path.join(__dirname, `../public/images/userPFP/${name[0].dataValues.name}.png`), buffer);
            fs.unlink(fPath,()=>{});
            res.redirect("/settings");
            return;
        } else {
            res.redirect("/");
            return;
        }
    }
    res.redirect("/settings");
}
exports.changeAccount = async (req,res)=>{
    if(req.session.token){
        let name = await users.checkToken(req.session.token,["name","ID"]);
        if(name[0]){
            name=name[0].dataValues;
            let pst = req.body;
            let check = await help.regValidity(pst.name,pst.pass,"");
            if(check.nameErr==""){
                let oPath = path.join(__dirname, "../public/images/userPFP/",name.name+".png");
                let nPath = path.join(__dirname, "../public/images/userPFP/",pst.name+".png");
                let moved = false;
                fs.rename(oPath,nPath,() => {moved=true;})
                while(!moved){
                    await help.sleep(40);
                }
                await users.setName(pst.name,name.ID);
                let tkn = help.createToken();
                req.session.token = tkn;
                await users.setToken(tkn,name.ID);
            }
            if(check.passErr==""){
                await users.setPassword(help.encrypt(check.pass, "OFbxO2O9KV~923rT|p]aQ}s|"),name.ID);
                let tkn = help.createToken();
                req.session.token = tkn;
                await users.setToken(tkn,name.ID);
            }
            let getHeader=await help.prepareHeader(req.session.token);
            getHeader=Object.assign(getHeader,{ 
                name: pst.name,
                nameErr: check.nameErr, 
                pass: pst.pass, 
                passErr: check.passErr,
                path:req.originalUrl
            })
            res.render('settings', getHeader);
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
}