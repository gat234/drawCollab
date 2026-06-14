let images = require('../models/image.mjs');
let users = require('../models/users.mjs');
let crypto = require("crypto");
const path = require('path');
const canvas = require("canvas");
let prep = require('../helpers/tempFunc.mjs');
let ran = require('../helpers/encrFunc.mjs');
let val = require('../helpers/checkInpFunc.mjs');
exports.imageView=async (req,res,next)=>{
    let img = await images.getImgByUrl(req.params.location,["name","width","height"]);
    if(!img[0]){
        res.redirect("/");
        return;
    }
    let imgData = img[0].dataValues;

    let c = canvas.createCanvas(imgData.width,imgData.height);
    let ctx = c.getContext("2d");
    try{
        await canvas.loadImage(path.join(__dirname, `../usr_images/${req.params.location}.png`))
        .then((img)=>{
            ctx.drawImage(img,0,0);
        })
    } catch {
        
    }
    let render = { 
        c:c.toDataURL(),
        imgName:imgData.name,
        level:2
    };
    let lan = req.session.lan;
    if (!req.session.lan){lan="EN"}
    let h = await prep.prepareHeader(req.session.token,lan);
    Object.assign(render,h);
    res.render('img/imgView', render);
}
exports.open=async (req,res,next)=>{
    if(req.session.token){
        let name = await users.checkToken(req.session.token,["name","ID"]);
        if(!name[0]){
            res.redirect("/");
            return;
        }
        let usr = name[0].dataValues;
        req.session.name = usr.name;
        let img = await images.getImgByUrl(req.params.location,["ID","access_type","width","height","visit","name"])
        if(!img[0]){
            res.redirect("/");
        } else {
            let data = img[0].dataValues
            let access = data.access_type;
            if(access==2||access==3){
                let usr_ID = await images.getImgUsers(data.ID,["user_ID"]);
                for(let i =0;i<usr_ID.length;i++){
                    console.log(usr.ID,usr_ID[i].dataValues,path.join(__dirname, `../usr_images/${req.params.location}.png`))
                    if(usr.ID==usr_ID[i].dataValues.user_ID){                   
                        await images.addVisitToImg(data.ID,data.visit);
                        let c = canvas.createCanvas(data.width,data.height);
                        let ctx = c.getContext("2d");
                        try{
                            await canvas.loadImage(path.join(__dirname, `../usr_images/${req.params.location}.png`))
                            .then((img)=>{
                                ctx.drawImage(img,0,0);
                            })
                        } catch {

                        }
                        res.render('img/draw', { 
                            c:c.toDataURL(),
                            imgName:data.name
                        });
                        return;
                    }
                }
            } else {
                await images.addVisitToImg(data.visit,data.ID);
                let c = canvas.createCanvas(data.width,data.height);
                let ctx = c.getContext("2d");
                try{
                    await canvas.loadImage(path.join(__dirname, `../usr_images/${req.params.location}.png`))
                    .then((img)=>{
                        ctx.drawImage(img,0,0);
                    })
                } catch {
                    
                }
                let lan = req.session.lan;
                if (!req.session.lan){lan="EN"}
                let render = await prep.prepareHeader(req.session.token,lan);
                Object.assign(render,{ 
                    c:c.toDataURL(),
                    level:2,
                    imgName:data.name
                });
                res.render('img/draw', render);
                return;
            }
        }
      
  } else {
    res.redirect("/");
  }
}
exports.creator = async (req,res)=>{
    if(req.session.token){
        let lan = req.session.lan;
        if (!req.session.lan){lan="EN"}
        let h = await prep.prepareHeader(req.session.token,lan);
        Object.assign(h,{ 
            self: req.originalUrl, 
            time: Date.now(),
            rand: 0, 
            name: "",
            nameErr: "", 
            width: "", 
            widthErr: "", 
            height: "", 
            heightErr: ""
        })
        res.render('img/new_img', h);
    } else {
        res.redirect("/");
    }
    
}
exports.newImage = async (req,res,next)=>{
    if(req.session.token){
        let usr_ID = await users.checkToken(req.session.token,["ID"]);
        let pst = req.body;
        let check = await val.imgValidity(pst.name,pst.width,pst.height);
        if(check.nameErr == "" && check.widthErr == "" && check.heightErr == ""){
            let newURL = crypto.randomBytes(18).toString('hex');
            while(true){
                let img = await images.getImgByUrl(newURL,["ID"])
                if(img.length==0){
                    break;
                } else {
                    newURL = crypto.randomBytes(18).toString('hex');
                }
            }
            usr_ID=usr_ID[0].dataValues.ID;
            await images.createImage(check.name,check.width,check.height,newURL,pst.visibility,usr_ID);
            res.redirect("./image/"+newURL);
            return;
        } else {
            let r = ran.rand(15);
            req.session.rand = r;
            if(!req.session.lan){
                req.session.lan="en";
            }
            res.render('img/new_img', { 
                self: req.originalUrl, 
                time: Date.now(),
                rand: r, 
                name: pst.name,
                nameErr: check.nameErr, 
                width: pst.width, 
                widthErr: check.widthErr, 
                height: pst.height, 
                heightErr: check.heightErr,
                lan:req.session.lan
            });
            return;
        }
    }
    res.redirect("/");
}
exports.getData = async (req,res,next)=>{
    if(req.session.token){
        let name = await users.checkToken(req.session.token,["name"]);
        let img = await images.getImgByUrl(req.params.location,["width","height"]);
        res.json({
            token: req.session.token,
            name:name[0].dataValues.name,
            width:img[0].dataValues.width,
            height:img[0].dataValues.height
        })
    } else {
        res.json({
            token: ""
        })
    }
    
}