let mouseX, mouseY;
let mousePressed = false;
let color = "#ff0000ff";
let tool = "pencil";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
let size = 2;

let drawers = [];
let req;
let tolerance = 0.1;
let sliderMoving = false;

let isMobile = false;
let moving = false;
let movePressed = false;
function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}
async function move(el){
  el.classList.add("hidden");
  let off1 = getOffset(el);
  let offY = off1["top"];
  let offX = off1["left"];
  movePressed = true;
  el.style.top = mouseY-offY+"px";
  el.style.left = mouseX-offX+"px";
  let off2 = getOffset(el);
  let offY1 = off1["top"]-off2["top"];
  let offX1 = off1["left"]-off2["left"];
  while(movePressed&&!sliderMoving){
    el.style.top = (mouseY-offY+offY1)+"px";
    el.style.left = (mouseX-offX+offX1)+"px";
    if (el.classList[1] == "hidden" || el.classList[2] == "hidden"){
      el.classList.remove("hidden");
    }
    await sleep(40);
  }
}
function drawLine(x1,y1,x2,y2,color,size){
  let canvas = document.getElementsByTagName("canvas")[0];
  let ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(x2, y2);
  ctx.lineTo(x1, y1);
  ctx.lineWidth = size;
  ctx.stroke();
}


function mvCurs(X,Y,tX,tY){
  let canvas = document.getElementsByTagName("canvas")[0];
  let b = canvas.getBoundingClientRect();
  if (mousePressed&&!moving) {
    let x1 = tX-b.left, 
    y1 = tY-b.top,
    x2 = X-b.left,
    y2 = Y-b.top;
    if(tool=="pencil"){
      drawLine(x1,y1,x2,y2,color,size);
    }
    if(tool=="moveView"){
      if(!isMobile){
        window.scrollBy((x1-x2)*4,(y1-y2)*4);
      } else {
        window.scrollBy((x1-x2),(y1-y2));
      }
      
    }
    
  }
  sendData(X-b.left,Y-b.top,mousePressed,tool);
}






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

    // console.log(posX,posY,color);
    ctx.fillStyle = color;
    ctx.fillRect(posX,posY,size,size);

  }

  changeD = true;
}

let data1 = [];
let wh = [];

function calcPixel(x,y,width){
  if(x>=0&&y>=0){
    return ((x))+(((y)*((width))));
  }
  
}
function colorCheck(x,y,width,clckCol,px,tolerance){
  if(y<0){console.log(y);return false;}
  return diffCheck(clckCol,px[calcPixel(x,y,width)]) < tolerance;
}
function colToArr(stn){
  return [
    parseInt(stn.slice(1,3),16),
    parseInt(stn.slice(3,5),16),
    parseInt(stn.slice(5,7),16),
    parseInt(stn.slice(7,9),16)
  ]
}
async function bucket(color, X, Y) {
  console.log(X,Y)
  const before = performance.now();
  if(color.length==7){
    color += "ff";
  }
  let canvas = document.getElementsByTagName("canvas")[0];
  let ctx = canvas.getContext("2d");
  let bounding = canvas.getBoundingClientRect();
  let xOff = X - Math.floor(bounding.left);
  let yOff = Y - Math.floor(bounding.top);
  let width = canvas.width;
  let height = canvas.height;
  let pixels = [];
  data1 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let i = 0; i < data1.length; i += 4) {
    pixels.push([data1[i],data1[i + 1],data1[i + 2],data1[i + 3]]);
  }
  let curCol = pixels[calcPixel(xOff,yOff,width)];

  if (!colorCheck(xOff,yOff,width,curCol,pixels,tolerance)){
    return;
  }
  let colArr = colToArr(color);
  let Q = [{x:xOff,y:yOff}];
  let delay=0;
  while(Q.length>0){
    delay++;
    if(delay>(((width*height*100)/Q.length))){
      delay=0;
      await sleep(40);
    }
    let n = Q[0];
    Q = Q.slice(1);
    if(colorCheck(n.x,n.y,width,curCol,pixels,tolerance)){
      pixels[calcPixel(n.x,n.y,width)] = colArr;
      createPixel(1,n.x,n.y,color);
      Q.push(
        {
          x:n.x-1,
          y:n.y
        },
        {
          x:n.x+1,
          y:n.y
        },
        {
          x:n.x,
          y:n.y-1
        },
        {
          x:n.x,
          y:n.y+1
        }
      )
    }
  }
  console.log(performance.now()-before,curCol);
  return;
  
}
function diffCheck(col1,col2){
  if(col1&&col2){
    // https://en.wikipedia.org/wiki/Color_difference
    let rAvg = (col1[0]+col2[0])/2;
    let dR=(col1[0]-col2[0])**2;
    let dG=(col1[1]-col2[1])**2;
    let dB=(col1[2]-col2[2])**2;
    let dC=Math.sqrt(((2+(rAvg/256))*dR)+(4*dG)+((2+((255-rAvg)/256))*dB));
    return (dC/1529)+(Math.abs(col1[3]-col2[3]))/255;
  }
  
}

