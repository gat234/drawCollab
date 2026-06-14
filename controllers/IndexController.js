let users = require('../models/users.mjs');
let images = require('../models/image.mjs');
const canvas = require("canvas");
const path = require('path');
const fs = require('fs');
let val = require('../helpers/checkInpFunc.mjs');
let prep = require('../helpers/tempFunc.mjs');
let imgFun = require('../helpers/imageFunc.mjs');
let crFun = require('../helpers/encrFunc.mjs');

exports.getIndex = async (req,res)=>{
    const img = await images.getPublicImages(0);
    let numOfImg = await images.getNumPublicImages();

    if(numOfImg>10){
        numOfImg=Math.ceil(numOfImg/10);
    }
    if(numOfImg>10){
        numOfImg=10;
    }
    let pageArr = Array.from({length: numOfImg}, (_, i) => i + 1);
    let lan = req.session.lan;
    if (!req.session.lan){lan="EN"}
    let tempData = await prep.prepareHeader(req.session.token,lan);
    tempData.publImg = await imgFun.getImgData(img);
    if(pageArr.length>1){
        tempData.pageFooter=pageArr;
    }

    res.render('index', tempData);
};
exports.getIndexPage = async (req,res)=>{
    req.params.page = parseInt(req.params.page)
    let imgOff = (req.params.page-1)*10;
    const img = await images.getPublicImages((req.params.page-1)*10);
    let numOfImg = await images.getNumPublicImages();
    numOfImg=Math.ceil((numOfImg-imgOff)/10);
    let lan = req.session.lan;
    
    if (!req.session.lan){lan="EN"}
    let tempData = await prep.prepareHeader(req.session.token,lan);
    tempData.publImg = await imgFun.getImgData(img);
    if(numOfImg>10){
        numOfImg=10;
    }
    let pageArr = Array.from({length: numOfImg}, (_, i) => (i + req.params.page));

    tempData.pageFooter=pageArr;
    tempData.isPage = true;

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
    let lan = req.session.lan;
    if (!req.session.lan){lan="EN"}
    let tempData = await prep.prepareHeader(req.session.token,lan);
    res.render('profile/settings', tempData);
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
                await val.sleep(40);
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
            let check = await val.regValidity(pst.name,pst.pass,"");
            if(check.nameErr==""){
                let oPath = path.join(__dirname, "../public/images/userPFP/",name.name+".png");
                let nPath = path.join(__dirname, "../public/images/userPFP/",pst.name+".png");
                let moved = false;
                fs.rename(oPath,nPath,() => {moved=true;})
                while(!moved){
                    await val.sleep(40);
                }
                await users.setName(pst.name,name.ID);
                let tkn = crFun.createToken();
                req.session.token = tkn;
                await users.setToken(tkn,name.ID);
            }
            if(check.passErr==""){
                await users.setPassword(crFun.encrypt(check.pass, "OFbxO2O9KV~923rT|p]aQ}s|"),name.ID);
                let tkn = crFun.createToken();
                req.session.token = tkn;
                await users.setToken(tkn,name.ID);
            }
            let lan = req.session.lan;
            if (!req.session.lan){lan="EN"}
            let getHeader=await prep.prepareHeader(req.session.token,lan);
            getHeader=Object.assign(getHeader,{ 
                name: pst.name,
                nameErr: check.nameErr, 
                pass: pst.pass, 
                passErr: check.passErr,
                path:req.originalUrl
            })
            res.render('profile/settings', getHeader);
        } else {
            res.redirect("/");
        }
    } else {
        res.redirect("/");
    }
}