import {checkToken} from '../models/users.mjs';
import {getImages,getUsersImg} from '../models/image.mjs';
import {getImgData} from './imageFunc.mjs'


export async function prepareHeader(tkn){
    let usrHeader = ["Log in", "/login",false,""];
    let pfpurl = "/images/default/default.png";
    if(tkn){
        let name = await checkToken(tkn,["name"]);
        name = name[0].dataValues.name;
        pfpurl=`/images/userPFP/${name}.png`;
        usrHeader[0]="Log Out";
        usrHeader[1]="/logout";
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
        } else {
            tempData.totalVisits = 0
        }
    } else {
        tempData.totalVisits = 0
    }
    
    return tempData;
}

