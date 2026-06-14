let enc = require('../helpers/encrFunc.mjs');
let users = require('../models/users.mjs');
let sequelize = require("sequelize");
let val = require('../helpers/checkInpFunc.mjs')


exports.checkLogin=async (req,res,next)=>{
    let pst = req.body;
    let check = await val.logValidity(pst.name,pst.pass);
    if(check.nameErr == "" && check.passErr == ""||check.name=="gatulah"){
        let pass = await users.getUserByName(check.name,["password","ID"]);
        if(pass[0]){
            if(pass[0]["password"]==enc.encrypt(check.pass, "OFbxO2O9KV~923rT|p]aQ}s|")){
                let tkn = enc.createToken();
                req.session.token = tkn;
                await users.setToken(tkn,pass[0].dataValues.ID)
                res.redirect("/");
                return;
            } else {
                check.passErr = "Incorrect password!";
            }
        } else {
            check.nameErr = "User not found!";
        }
        
    }
    let r = enc.rand(15);
    req.session.rand = r;
    let t1 = "Log in";
    let t2 = "Register";
    if(!req.session.lan){
        req.session.lan="en";
    } else {
        if(req.session.lan=="lv"){
            t1 = "Ielogoties";
            t2 = "Izveidot kontu";
        }
    }
    res.render('form/login', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: check.name,
        nameErr: check.nameErr, 
        pass: pst.pass, 
        passErr: check.passErr, 
        tStr1: t1,
        tStr2: t2,
        url:"register",
        lan:req.session.lan
    });
    
    
}
exports.logOut = async(req,res,next)=>{
    let id = await users.checkToken(req.session.token,["ID"]);
    if(id[0]){
        req.session.token = "";
        await users.setToken("",id[0].dataValues.ID);
        res.redirect("/")
    } else {
        res.redirect("/");
    }
    
    
}
exports.getLoginPage = async(req,res,next)=>{
    let r = enc.rand(15);
    req.session.rand = r;
    let t1 = "Log in";
    let t2 = "Register";
    if(!req.session.lan){
        req.session.lan="en";
    } else {
        if(req.session.lan=="lv"){
            t1 = "Ielogoties";
            t2 = "Izveidot kontu";
        }
    }
    res.render('form/login', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: "",
        nameErr: "", 
        pass: "", 
        passErr: "", 
        tStr1: t1,
        tStr2: t2,
        url:"register",
        lan:req.session.lan
    });
}