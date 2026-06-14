import {getImgUsers} from '../models/image.mjs';
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