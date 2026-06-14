let users = require('../models/users.mjs');
let crypto = require("crypto");
let enc = require('../helpers/encrFunc.mjs');
let imgFun = require('../helpers/imageFunc.mjs');
let val = require('../helpers/checkInpFunc.mjs')

exports.Register=async (req,res,next)=>{
    let pst = req.body;
    let check = await val.regValidity(pst.name,pst.pass,pst.email);
    if(pst.submit && pst.randcheck == req.session.rand){
        if(check.nameErr==""&&check.passErr==""&&check.emailErr==""){
            let encr = enc.encrypt(check.pass, "OFbxO2O9KV~923rT|p]aQ}s|");
            let tkn = enc.createToken();
            req.session.token = tkn;
            await users.createUser(check.name,encr,check.email,tkn);
            res.redirect("/");
            imgFun.createPfp(check.name);
            return;
        }
    }

    let r = enc.rand(15);
    req.session.rand = r;
    let t1 = "Create";
    let t2 = "Log in";
    if(!req.session.lan){
        req.session.lan="en";
    } else {
        if(req.session.lan=="lv"){
            t1 = "Izveidot kontu";
            t2 = "Ielogoties";
        }
    }
    res.render('form/register', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: pst.name,
        nameErr: check.nameErr, 
        pass: pst.pass, 
        passErr: check.passErr, 
        email: pst.email, 
        emailErr: check.emailErr,
        tStr1: t1,
        tStr2: t2,
        url:"login",
        lan:req.session.lan
    });
};
exports.getRegisterPage = async (req,res)=>{
    let r = enc.rand(15);
    req.session.rand = r;
    let t1 = "Create";
    let t2 = "Log in";
    if(!req.session.lan){
        req.session.lan="en";
    } else {
        if(req.session.lan=="lv"){
            t1 = "Izveidot kontu";
            t2 = "Ielogoties";
        }
    }
    res.render('form/register', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: "",
        nameErr: "", 
        pass: "", 
        passErr: "", 
        email: "", 
        emailErr: "",
        tStr1: t1,
        tStr2: t2,
        url:"login",
        lan:req.session.lan
    });
};