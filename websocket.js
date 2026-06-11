const WebSocket = require('ws');
let users = require('./models/users.mjs');
let image = require('./models/image.mjs');
const canvas = require("canvas");
const wss = new WebSocket.Server({ port: 3300 });
let locations = {};
let numReq = Math.floor(Math.random()*500)-250;
const p = require('path');
const fs = require('fs');
function checkObject(obj,str){
    return Object.keys(obj).includes(str);
}
wss.on('connection', function connection(ws,req) {
    if (ws.readyState === WebSocket.OPEN){
        ws.send(`getName${numReq}`);
    }
    if(!locations[req.url.slice(1)]){
        locations[req.url.slice(1)] = [{usr:ws,name:"",req:numReq}];
        numReq+=Math.floor(Math.random()*500)-250;
    } else {
        locations[req.url.slice(1)].push({usr:ws,name:"",req:numReq});
        numReq+=Math.floor(Math.random()*500)-250;
    }
    let wsp = req.headers['user-agent']; 
    console.log('Client connected',wsp);
    

    ws.on('close', function close() {
        console.log('Client disconnected');
    });
    ws.onmessage = async (e) => {
        let data = JSON.parse(e.data);
        let path = data["path"];
        if(checkObject(data,"req")) {
            let curClients = locations[path];
            for(let i = 0;i<curClients.length;i++){
                console.log(curClients[i].req,data.req,e.readyState)
                if(curClients[i].req==data.req){
                    curClients[i].name=data.usr;
                    break;
                }
            }
        } else if(checkObject(data,"unload")){
            let curClients = locations[path];
            for(let i = 0;i<curClients.length;i++){
                console.log(curClients[i].req,data.unload,"unload")
                if(curClients[i].req==data.unload){
                    curClients.splice(i,1);
                    break;
                }
            }
        } else if(checkObject(data,"save")){
            
            data.path = data.path.replace("/image/","");
            let name = await users.checkToken(data.tkn,["name","ID"]);
            let usr_name;
            if(name[0]){
                usr_name = name[0].dataValues.name;
                if(usr_name!=data.usr){
                    return;
                }
            }
            let img = await image.getImgByUrl(data.path,["id","access_type","width","height"]);
            
            if(img[0]){
                
                let imga = await img[0].dataValues;
                if(imga.access_type==2||imga.access_type==3){
                    let check = await image.checkImgUser(imga.id,usr_name);
                    if(!check[0]){
                        return;
                    }
                }
                
                let c = canvas.createCanvas(imga.width,imga.height);
                let ctx = c.getContext("2d");
                await canvas.loadImage(data.dUrl)
                .then((imga)=>{
                    ctx.drawImage(imga,0,0);
                });
                const buffer = c.toBuffer("image/png");
                fs.writeFileSync(p.join(__dirname, `./usr_images/${data.path}.png`), buffer);
            } else {
                return;
            }
        }else {
            if(data.tkn&&data.usr){
                let name = await users.checkToken(data.tkn,["name"]);
                if(name[0]){
                    if(name[0].dataValues.name!=data.usr){
                        return;
                    }
                }
            } else {
                return;
            }
            for(let i = 0;i<locations[path].length;i++){
                client = locations[path][i].usr;
                
                let name = locations[path][i].name;
                // console.log(name,data.usr)
                if(name!=""&&name!=data.usr){
                    
                    if (client.readyState === WebSocket.OPEN){
                        delete data.tkn;
                        delete data.path;
                        client.send(JSON.stringify(data));
                    } else {
                        locations[path].splice(i,1);
                    }
                }
            }
        }
        
        // wss.clients.forEach((client,req) => {    
        //     for()
        //     // if (client.readyState === WebSocket.OPEN &&
        //     // (checkObject(data,"refreshFaces"))) {
        //     //     client.send(e.data);
        //     // }
        // });
    };
});