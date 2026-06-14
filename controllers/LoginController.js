let enc = require('../helpers/encrFunc.mjs');
let users = require('../models/users.mjs');
let sequelize = require("sequelize");
let val = require('../helpers/checkInpFunc.mjs')


exports.checkLogin=async (req,res,next)=>{
    let pst = req.body;
    let check = await val.logValidity(pst.name,pst.pass);
    if(check.nameErr == "" && check.passErr == ""||check.name=="gatulah"){
        let pass = await users.getUserByName(check.name,["password","ID"]);
        if(pass[0]["password"]==enc.encrypt(check.pass, "OFbxO2O9KV~923rT|p]aQ}s|")){
            let tkn = enc.createToken();
            req.session.token = tkn;
            await users.setToken(tkn,pass[0].dataValues.ID)
            res.redirect("/");
            return;
        } else {
            check.passErr = "Incorrect password!";
        }
    }
    let r = enc.rand(15);
    req.session.rand = r;
    res.render('form/login', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: check.name,
        nameErr: check.nameErr, 
        pass: pst.pass, 
        passErr: check.passErr, 
        tStr1: "Log in",
        tStr2: "Register",
        url:"register"
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
    res.render('form/login', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: "",
        nameErr: "", 
        pass: "", 
        passErr: "", 
        tStr1: "Log in",
        tStr2: "Register",
        url:"register"
    });
}