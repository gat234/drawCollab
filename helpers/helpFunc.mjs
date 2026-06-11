import crypto from 'crypto'
import {checkName,checkEmail,checkToken,getUserByName} from '../models/users.mjs';
import {getImgUsers,getImages,getUsersImg} from '../models/image.mjs';
import validator from "email-validator";
import {createCanvas,loadImage} from 'canvas';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export async function getImgData(images,getUsers=false){
    let ret = [];
    for(let i = 0;i<images.length;i++){
        let imgData = images[i].dataValues;
        if(!imgData){continue;}
        let c = createCanvas(imgData.width,imgData.height);
        let ctx = c.getContext("2d");
        try{
            await loadImage(path.join(__dirname, `../usr_images/${imgData.url}.png`))
            .then((img)=>{
                ctx.drawImage(img,0,0);
            })
        } catch {
            
        }
        let finalData = {
            "dUrl":c.toDataURL(),
            "name":imgData.name,
            "desc":imgData.description,
            "visit":imgData.visit,
            "url":imgData.url,
            "visibility":imgData.access_type
        }
        if(getUsers){
            let imgUsers = [];
            let res = await getImgUsers(imgData.ID,["name"]);
            for(let i =0;i<res.length;i++){
                imgUsers.push(res[i])
            }
            finalData.users = imgUsers;
        }
        
        ret.push(finalData)
    }
    return ret;
}
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export function rand(len){
    let str = "";
    for(let i=0;i<len;i++){
        str+=Math.floor(Math.random()*10).toString();
    }
    return str;
}
function genKey(key){
    let secret_key = crypto.createHash('sha512');
    secret_key = secret_key.update(key);
    secret_key = secret_key.digest('hex');
    secret_key = secret_key.substring(0, 32);
    let encryptionIV = crypto.createHash('sha512');
    encryptionIV = encryptionIV.update(key);
    encryptionIV = encryptionIV.digest('hex');
    encryptionIV = encryptionIV.substring(0, 16);
    return [secret_key,encryptionIV];
}
export function encrypt(plainText, key) {
    let keys = genKey(key);
    const cipher = crypto.createCipheriv("aes-256-cbc", keys[0], keys[1]);
    return Buffer.from(cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex')).toString('base64')
}
export function decrypt(encryptText, key){
    const buff = Buffer.from(encryptText, 'base64');
    let keys = genKey(key);
    const decipher = crypto.createDecipheriv("aes-256-cbc",keys[0],keys[1]);
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    )
}

export async function prepareHeader(tkn){
    let usrHeader = ["Log in", "/login",false,""];
    let pfpurl = "/images/default/default.png";
    if(tkn){
        let name = await checkToken(tkn,["name"]);
        name = name[0].dataValues.name;
        pfpurl=`/images/userPFP/${name}.png`;
        usrHeader[0]="Log Out";
        usrHeader[1]="./logout";
        usrHeader[2]=true;
        usrHeader[3]=name;
    }
    return { 
        title: tkn,
        pfpUrl: pfpurl,
        prof_log: usrHeader[0],
        signUrl: usrHeader[1],
        loggedIn:usrHeader[2],
        name:usrHeader[3]
    }
}

export function escapeHtml(text) {
    // Source - https://stackoverflow.com/a/4835406
// Posted by Kip, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-23, License - CC BY-SA 3.0
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

export function cleanStr(str){
    str = str.trim();
    return escapeHtml(str);
}
export function createToken(){
    return crypto.randomBytes(18).toString('hex');
}
export async function regValidity(name,password,email){
    let nameErr = "";
    let passErr = "";
    let emailErr = "";
    if(!name){
        nameErr = "Name is required";
    } else {
        name = cleanStr(name);
        const usr = await checkName(name);
        if(usr.length!=0){
            nameErr = "Username is taken!";
        }
    }
    if(!email){
        emailErr = "Email is required";
    } else {
        email = cleanStr(email);
        if(!validator.validate(email)){
            emailErr = "Invalid email!";
        } else {
            const usr = await checkEmail(email);
            if(usr.length!=0){
                emailErr = "Email is taken!";
            }
        }
    }
    if(!password){
        passErr = "Password is required";
    } else {
        password = cleanStr(password);
        if(password.length<8){
            passErr = "Password should be at least 8 characters long!";
        }
    }

    return {
        name:name,
        pass:password,
        email:email,
        nameErr:nameErr,
        passErr:passErr,
        emailErr:emailErr
    }
}
export async function logValidity(name,password,email){
    let nameErr = "";
    let passErr = "";
    if(!name){
        nameErr = "Name or E-mail is required";
        name = "";
    } else {
        name = cleanStr(name);
    }
    if(!password){
        passErr = "Password is required";
        password = "";
    } else {
        password = cleanStr(password);
    }

    return {
        name:name,
        pass:password,
        nameErr:nameErr,
        passErr:passErr
    }
}
export async function imgUsrValidity(name,imgUrl){
    let nameErr = "";
    if(!name){
        nameErr = "Name or E-mail is required";
        name = "";
    } else {
        let res = await getUserByName(name,["ID"]);
        if(res[0]){
            name = cleanStr(name);
        } else {
            nameErr = "Invalid Name or E-mail!";
            name = "";
        }
    }
    return {
        name:name,
        nameErr:nameErr
    }
}
export async function getProfileTemplate(usrID,tkn){
    let usrImg = await getUsersImg(usrID);
    let tempData = await prepareHeader(tkn);
    tempData.publImg = [];
    if(usrImg[0]){
        let data = await getImages(usrImg);
        let imgData = await getImgData(data,true);
        if(imgData[0]){
            tempData.publImg = imgData;
            let totalVisits = 0;
            for(let i = 0;i<imgData.length;i++){
                totalVisits+=imgData[i].visit;
            }
            tempData.totalVisits = totalVisits;
        }
    }
    
    return tempData;
}
function checkNum(num){
    num = num.replace("px","");
    if(!isNaN(num) && 
    parseInt(Number(num)) == num && 
    !isNaN(parseInt(num, 10))){
        return num;
    } else {
        return "false";
    }
}
export async function imgValidity(name,width,height){
    let nameErr = "";
    let widthErr = "";
    let heightErr = "";
    if(!name){
        nameErr = "Name is required";
        name = "";
    } else {
        name = cleanStr(name);
    }
    if(!width){
        widthErr = "Width is required";
        width = "";
    } else {
        width = cleanStr(width);
        width = checkNum(width);
        if(width == "false"){
            widthErr = "Not a Number!";
            width = "";
        } 
    }
    if(!height){
        heightErr = "Height is required";
        height = "";
    } else {
        height = cleanStr(height);
        height = checkNum(height);
        if(height == "false"){
            heightErr = "Not a Number!";
            height = "";
        }
    }
    return {
        name:name,
        width:width,
        height:height,
        nameErr:nameErr,
        heightErr:heightErr,
        widthErr:widthErr
    }
}
export async function createPfp(username) {
    let canvas = createCanvas(100,100);
    let ctx = canvas.getContext('2d');
    let col = [Math.floor((Math.random()*100)+125),Math.floor((Math.random()*100)+125),Math.floor((Math.random()*100)+125)]
    ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; 
    ctx.fillRect(0,0,100,100);
    ctx.fillStyle = `rgb(${255-col[0]},${255-col[1]},${255-col[2]})`;
    ctx.font = "bold 50px Liberation Mono"
    ctx.fillText(username[0],35,65);
    const buffer = canvas.toBuffer("image/png");
    
    fs.writeFileSync(path.join(__dirname, `../public/images/userPFP/${username}.png`), buffer);
}