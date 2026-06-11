let images = require('../models/image.mjs');
let help = require('../helpers/helpFunc.mjs');
let users = require('../models/users.mjs');
let crypto = require("crypto");
const path = require('path');
const canvas = require("canvas");
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
    let h = await help.prepareHeader(req.session.token);
    Object.assign(render,h);
    res.render('imgView', render);
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
        let img = await images.getImgByUrl(req.params.location,["ID","access_type","width","height","visit"])
        if(!img[0]){
            res.redirect("/");
        } else {
            let data = img[0].dataValues
            let access = data.access_type;
            if(access==2||access==3){
                let usr_ID = await images.getImgUsers(data.ID,["usr_ID"]);
                //FIX
                for(let i =0;i<usr_ID.length;i++){
                    if(usr.ID==usr_ID[i].dataValues.ID){
                        // res.sendFile(path.join(__dirname, '../public/drawing/index.html'));
                        res.render('draw', { 
                            c:c.toDataURL()
                        });
                        await images.addVisitToImg(data.ID,data.visit);
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
                
                let render = await help.prepareHeader(req.session.token);
                Object.assign(render,{ 
                   c:c.toDataURL(),
                   level:2
                });
                res.render('draw', render);
                return;
            }
        }
      
  } else {
    res.redirect("/");
  }
}
exports.creator = async (req,res)=>{
    if(req.session.token){
        let h = await help.prepareHeader(req.session.token);
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
        res.render('new_img', h);
    } else {
        res.redirect("/");
    }
    
}
exports.newImage = async (req,res,next)=>{
    if(req.session.token){
        let usr_ID = await users.checkToken(req.session.token,["ID"]);
        let pst = req.body;
        let check = await help.imgValidity(pst.name,pst.width,pst.height);
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
            usr_ID=usr_ID[0].dataValues.ID
            await images.createImage(check.name,check.width,check.height,newURL,pst.visibility,usr_ID);
            res.redirect("./image/"+newURL);
            return;
        } else {
            let r = help.rand(15);
            req.session.rand = r;
            res.render('new_img', { 
                self: req.originalUrl, 
                time: Date.now(),
                rand: r, 
                name: pst.name,
                nameErr: check.nameErr, 
                width: pst.width, 
                widthErr: check.widthErr, 
                height: pst.height, 
                heightErr: check.heightErr
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