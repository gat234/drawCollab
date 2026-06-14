import {checkName,checkEmail,getUserByName} from '../models/users.mjs';
import validator from "email-validator";


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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