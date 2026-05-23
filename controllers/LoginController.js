let help = require('../helpers/helpFunc.mjs');
let users = require('../models/users.mjs');
let crypto = require("crypto");
let sequelize = require("sequelize");
exports.checkLogin=async (req,res,next)=>{
    let pst = req.body;
    let check = await help.logValidity(pst.name,pst.pass);
    if(check.nameErr == "" && check.passErr == ""){
        let pass = await users.users_Model.findAll({
            attributes: ["password","ID"],
            where:{
                [sequelize.Op.or]: [
                    {
                        name:check.name
                    },
                    {
                        email:check.name
                    }
                ]
            }
        });
        if(pass[0]["password"]==help.encrypt(check.pass, "OFbxO2O9KV~923rT|p]aQ}s|")){
            let tkn = crypto.randomBytes(18).toString('hex');
            req.session.token = tkn;
            await users.users_Model.update(
                {
                    token:tkn
                },
                {
                    where:{
                        ID:pass[0].dataValues.ID
                    }
                }
            );
            res.redirect("/");
            return;
        } else {
            check.passErr = "Incorrect password!";
        }
    }
}
exports.logOut = async(req,res,next)=>{
    let id = await users.users_Model.findAll({
        attributes: ["ID"],
        where:{
            token:req.session.token
        }
    });
    req.session.token = "";
    console.log(id)
    await users.users_Model.update(
        {
            token:""
        },
        {
            where:{
                ID:id[0].dataValues.ID
            }
        }
    );
    res.redirect("/");
}
exports.getLoginPage = async(req,res,next)=>{
    let r = help.rand(15);
    req.session.rand = r;
    res.render('login', { 
        self: req.originalUrl, 
        time: Date.now(),
        rand: r, 
        name: "",
        nameErr: "", 
        pass: "", 
        passErr: "", 
        email: "", 
        emailErr: "",
        tStr1: "Log in",
        tStr2: "Register",
        url:"register"
    });
}
