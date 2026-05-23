import crypto from 'crypto'
import {users_Model} from '../models/users.mjs';
import validator from "email-validator";
import {createCanvas} from 'canvas';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export async function regValidity(name,password,email){
    let nameErr = "";
    let passErr = "";
    let emailErr = "";
    if(!name){
        nameErr = "Name is required";
    } else {
        name = cleanStr(name);
        const usr = await users_Model.findAll({
            where:{
                name: name
            }
        });
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
            const usr = await users_Model.findAll({
                where:{
                    email: email
                }
            });
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