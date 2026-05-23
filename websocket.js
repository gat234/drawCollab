const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3300 });
let locations = {};
wss.on('connection', function connection(ws,req) {

    if(!locations[req.url.slice(1)]){
        locations[req.url.slice(1)] = [ws];
    } else {
        locations[req.url.slice(1)].push(ws);
    }
    let wsp = req.headers['user-agent']; 
    console.log('Client connected',wsp);


    ws.on('close', function close() {
    console.log('Client disconnected');
    });
    ws.onmessage = (e) => {
        // console.log(`New message: ${e.data}`);
        let data = JSON.parse(e.data);
        for(let i = 0;i<locations[data["path"]].length;i++){
            client = locations[data["path"]][i];
            
            if (client.readyState === WebSocket.OPEN){
                client.send(e.data);
            }
        }
        // wss.clients.forEach((client,req) => {    
        //     for()
        //     // if (client.readyState === WebSocket.OPEN &&
        //     // (e.data.includes("refreshFaces"))) {
        //     //     client.send(e.data);
        //     // }
        // });
    };
});