const webSocket = new WebSocket(`ws://192.168.1.38:3300/${window.location.pathname}`);
let connected = false;
webSocket.onopen = function(event) {
  console.log("WebSocket connection established");
  connected = true;
};

webSocket.onmessage = async function(e) {
  if(e.data.includes("getName")){
    req = e.data.replace("getName","");
    sendCommand(JSON.stringify({
      "req":req,
      "usr":sessionStorage.getItem("name"),
      "path":window.location.pathname
    }));
  } else {
    let d = JSON.parse(e.data);
    if(d.usr==sessionStorage.getItem("name")){
      return;
    }
    if(!drawers.includes(d.usr)){
      drawers.push(d.usr);
      let para = document.createElement("div");
      let node = document.createTextNode("");
      para.setAttribute("class","overlay");
      para.setAttribute("id",d.usr);
      para.appendChild(node);
      document.body.appendChild(para);
    }
    let canvas = document.getElementsByTagName("canvas")[0];
    let b = canvas.getBoundingClientRect();
    let usrEl = document.getElementById(d.usr);
    if(d.held=="mobile"){
      usrEl.dataset.mobile = "store";
      
      
    } else if (d.held&&usrEl.left) {
      if (d.tool == "pencil") {
        if(usrEl.dataset.mobile=="store"){
          usrEl.left = `${d.X}px`
          usrEl.top = `${d.Y}px`
          usrEl.dataset.mobile="";
        }
        let x1 = usrEl.left.replace("px",""), 
        y1 = usrEl.top.replace("px",""),
        x2 = d.X,
        y2 = d.Y;
        drawLine(x1,y1,x2,y2,d.color,d.size);
      }
      if (d.tool == "bucket") {
        let canvas = document.getElementsByTagName("canvas")[0];
        let bounding = canvas.getBoundingClientRect();
        let xOff = d.X + Math.floor(bounding.left);
        let yOff = d.Y + Math.floor(bounding.top);
        bucket(d.color, Math.floor(xOff), Math.floor(yOff));
      }
    }
    if(d.held!="mobile"){
      usrEl.setAttribute("style",`left: ${d.X+b.left}px;top:${d.Y+b.top}px`);
    }
    
    usrEl.left = `${d.X}px`
    usrEl.top = `${d.Y}px`
    
    console.log(e.data);
  }
}
function sendCommand(command) {
  if(connected){
    webSocket.send(command);
  }
}

function saveImage(){
  sendCommand(JSON.stringify({
    "path":window.location.pathname,
    "tkn":sessionStorage.getItem("token"),
    "usr":sessionStorage.getItem("name"),
    "save":true,
    "dUrl":document.getElementsByTagName("canvas")[0].toDataURL()
  }));
}

function sendData(X,Y,held,tool){

  sendCommand(JSON.stringify({
    "X":X,
    "Y":Y,
    "usr":sessionStorage.getItem("name"),
    "tkn":sessionStorage.getItem("token"),
    "path":window.location.pathname,
    "held":held,
    "tool":tool,
    "color":color,
    "size":size
  }));
  
  
}