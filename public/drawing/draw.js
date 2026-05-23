let mouseX, mouseY;
let mousePressed = false;
let color = "#ff0000ff";
let tool = "pen";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
let size = 2;
window.addEventListener('load', async function () {
  let canvas = document.getElementsByTagName("canvas")[0];
  let ctx = canvas.getContext('2d');
  let img = new Image;
  img.onload = function(){
    ctx.drawImage(img,0,0); // Or at whatever offset you like
  };
  img.src = "data:image/png;base64,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";
  let wh = canvas.getBoundingClientRect();
  canvas.setAttribute("width",wh.width);
  canvas.setAttribute("height",wh.height);
  color = document.getElementsByClassName("colChoo")[0].value;

  document.getElementById("lol").onchange = function(e) {
    color = e.target.value;
    if(color.length==7){
      color += "ff";
    }
    // color = Buffer.from(color.replace("#",""), 'hex');
    console.log(color)
  }
  document.getElementById("lmao").onclick = function(e) {
    tool = "pen";
  }
  document.getElementById("margara").onclick = function(e) {
    tool = "bucket";
  }
  document.addEventListener('keyup', function(event) {
    if(event.key=="b"){
      tool="bucket";
    }
    if(event.key=="p"){
      tool="pen";
    }
  });
});
function drawLine(x1,y1,x2,y2){
  let canvas = document.getElementsByTagName("canvas")[0];
  let ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x2, y2);
  ctx.lineTo(x1, y1);
  ctx.lineWidth = size;
  ctx.stroke();
}
onmousemove = async function (e) {
  if (mousePressed) {
    let x1 = mouseX, 
    y1 = mouseY,
    x2 = e.clientX,
    y2 = e.clientY;
    drawLine(x1,y1,x2,y2);
  }
  document.getElementById("bbbb").innerHTML = `X: ${e.clientX} Y: ${e.clientY}`;
  mouseX = e.clientX;
  mouseY = e.clientY;
};
onmousedown = event => {
  if (event.defaultPrevented) {
    return;
  }
  if (event.button == 0) {
    if (tool == "pen") {
      mousePressed = true;
      createPixel(size, mouseX, mouseY, color);
    }
    if (tool == "bucket") {
      bucket(color, mouseX, mouseY);
    }
  }
  console.log(event.button);
  if (event.button == 2) {
    if (tool == "bucket") {
      tool = "pen";
    }
  }
  if (event.button == 1) {
    if (tool == "pen") {
      tool = "bucket";
    }
  }
};
onmouseup = event => {
  if (event.defaultPrevented) {
    return;
  }
  if (event.button == 0) {
    if (tool == "pen") {
      mousePressed = false;
    }
  }
};
document.addEventListener('wheel', function (event) {
  if (tool == "pen") {
    if (event.deltaY > 0) {
      if (size > 1) {
        size--;
      }
    } else {
      size++;
    }
  }
});


let changeD = false;
async function createPixel(size, posX, posY, color) {
  let canvas = document.getElementsByTagName("canvas")[0];
  let ctx = canvas.getContext("2d");
  if(color.length==4){
    let r = color[0].toString(16);
    let g = color[1].toString(16);
    let b = color[2].toString(16);
    let a = color[3].toString(16);
    if(r.length==1){r+="0";}
    if(g.length==1){g+="0";}
    if(b.length==1){b+="0";}
    if(a.length==1){a+="0";}
    color = "#"+r+g+b+a;
  }

  if(size.constructor==Object){
    ctx.fillStyle = color;
    ctx.fillRect(posX,posY,size["x"],size["y"]);

  } else {
    ctx.fillStyle = color;
    ctx.fillRect(posX,posY,size,size);

  }

  changeD = true;
}

let data1 = [];
let wh = [];

function calcPixel(x,y,width){
  return ((x))+(((y)*((width))));
}
function colorCheck(x,y,width,clckCol,px){
  return JSON.stringify(clckCol) == JSON.stringify(px[calcPixel(x,y,width)]);
}

async function bucket(color, x1, y1) {
  const before = performance.now();
  if(color.length==7){
    color += "ff";
  }
  if(color.length!=4){
    // color = Buffer.from(color.replace("#",""), 'hex');
  }
  let canvas = document.getElementsByTagName("canvas")[0];
  let bounding = canvas.getBoundingClientRect();
  let x = x1 - bounding.left;
  let y = y1 - bounding.top;
  let width = bounding.width;
  let height = bounding.height;
  console.log(x,y,"coords");
  let pixels = [];
  data1 = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;

  for (let i = 0; i < data1.length; i += 4) {
    pixels.push([data1[i],data1[i + 1],data1[i + 2],data1[i + 3]]);
  }
  let curCol = pixels[calcPixel(x,y,width)];
  if (!colorCheck(x,y,width,curCol,pixels)){
    return;
  }
  let s = [[x,x,y,1],[x,x,y-1,-1]];
  let drawAble = [];
  
  while(s.length!=0){
    let pos = s.pop();
    let x1=pos[0];
    let x2=pos[1];
    let y=pos[2];
    let dy=pos[3];
    let x = x1;
    let row=[];
    if(colorCheck(x,y,width,curCol,pixels)){
      while (colorCheck(x-1,y,width,curCol,pixels)){
        // createPixel(1,x-1,y,"red");
        row.push(x-1);
        pixels[calcPixel(x-1,y,width)] = [255,0,0,255];
        x--;
        if(x<x1){
          s.push([x,x1-1,y-dy,-dy]);
        }
      }
    }
    while(x1<=x2){
      while (colorCheck(x1,y,width,curCol,pixels)){
        // createPixel(1,x1,y,"red");
        row.push(x1);
        pixels[calcPixel(x1,y,width)] = [255,0,0,255];
        x1++;
      }
      if(x1>x){
        s.push([x,x1-1,y+dy,dy]);
      }
      if(x1-1>x2){
        s.push([x2+1,x1-1,y-dy,-dy]);
      }
      x1++;
      while(x1<=x2 && !colorCheck(x1,y,width,curCol,pixels)){
        x1++;
      }
      x=x1;
    }
    await sleep(100);
    drawLine(Math.min.apply(Math,row),y,Math.max.apply(Math,row)+1,y);
  }
  console.log(performance.now()-before,curCol,x);
  return;
  
}