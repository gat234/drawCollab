let users = require('../models/users.mjs');
let help = require('../helpers/helpFunc.mjs');
let crypto = require("crypto");


exports.Register=async (req,res,next)=>{
    let pst = req.body;
    let check = await help.regValidity(pst.name,pst.pass,pst.email);
    if(pst.submit && pst.randcheck == req.session.rand){
        if(check.nameErr==""&&check.passErr==""&&check.emailErr==""){
            let enc = help.encrypt(check.pass, "OFbxO2O9KV~923rT|p]aQ}s|");
            let tkn = crypto.randomBytes(18).toString('hex');
            req.session.token = tkn;
            await users.users_Model.create({ 
                name: check.name, 
                password: enc, 
                email:check.email,
                token:tkn
            });
            res.redirect("/");
            help.createPfp(check.name);
            return;
        }
    }

    let r = help.rand(15);
    req.session.rand = r;
    res.render('register', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: pst.name,
        nameErr: check.nameErr, 
        pass: pst.pass, 
        passErr: check.passErr, 
        email: pst.email, 
        emailErr: check.emailErr,
        tStr1: "Create",
        tStr2: "Log in",
        url:"login"
    });
};
exports.getRegisterPage = async (req,res)=>{
    let r = help.rand(15);
    req.session.rand = r;
    res.render('register', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: "",
        nameErr: "", 
        pass: "", 
        passErr: "", 
        email: "", 
        emailErr: "",
        tStr1: "Create",
        tStr2: "Log in",
        url:"login"
    });
};