var touchDevice = ('ontouchstart' in document.documentElement);

window.addEventListener('load', async function () {

  color = document.getElementsByClassName("colChoo")[0].value;
  document.getElementById("pencil").classList.add("sel");
  document.getElementById("lol").onchange = function(e) {
    color = e.target.value;
    if(color.length==7){
      color += "ff";
    }

    console.log(color)
  }
  let tools = document.getElementsByClassName("tIcon");
  for(let i =0;i<tools.length;i++){
    tools[i].onclick = function(e) {
      mousePressed = false;
      document.getElementById(tool).classList.remove("sel");
      tool = e.target.id;
      e.target.classList.add("sel");
      let num = document.getElementById("num");
      let slider = document.getElementById("toolOption");
      let inpStr = '<input type="number" value="2" id="num">';
      if(e.target.id=="bucket"){
        num.parentElement.innerHTML="Sensitivity "+inpStr;
        num = document.getElementById("num");
        console.log(tolerance*100);
        num.value=tolerance*100;
        slider.value=tolerance*100;
        slider.max=20;
        slider.min=0;
        num.style.width = ((num.value.toString().length + 5 ) * 8) + 'px';
      }
      if(e.target.id=="pencil"){
        num.parentElement.innerHTML="Pencil size "+inpStr;
        num = document.getElementById("num");
        num.value=size;
        slider.value=size;
        slider.min=1;
        slider.max=100;
        num.style.width = ((num.value.toString().length + 5 ) * 8) + 'px';
      }
    }
  }
  document.addEventListener('keyup', function(e) {
    if(e.key=="b"){
      tool="bucket";
    }
    if(e.key=="p"){
      tool="pencil";
    }
    if(e.key=="m"){
      tool="moveView";
    }
  });
  let wC = document.getElementById("num");
  wC.style.width = ((wC.value.toString().length + 5) * 8) + 'px';
  wC.addEventListener("input",function(){
    this.style.width = ((this.value.toString().length + 5 ) * 8) + 'px';
    size=this.value;
  });
  let slider = document.getElementById("toolOption");
  slider.value = wC.value;
  size=wC.value;
  slider.addEventListener("input",function(e){
    let wC = document.getElementById("num");
    wC.value=e.target.value;
    if(tool=="pencil"){
      size=e.target.value;
    }
    if(tool=="bucket"){
      tolerance=parseFloat((e.target.value/100).toFixed(2));
    }
    sliderMoving = true;
  });
  fetch(window.location.href+'/data')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    sessionStorage.setItem("name",data.name);
    sessionStorage.setItem("token",data.token);
    sessionStorage.setItem("width",data.width);
    sessionStorage.setItem("height",data.height);
    let canvas = document.getElementsByTagName("canvas")[0];
    let ctx = canvas.getContext('2d');
    let img = new Image;
    img.onload = function(){
      ctx.drawImage(img,0,0);
    };
    let imgDat = document.getElementById("imgData");
    img.src = imgDat.innerHTML;
    imgDat.remove();
    let wh = canvas.getBoundingClientRect();
    canvas.setAttribute("width",sessionStorage.getItem("width"));
    canvas.setAttribute("height",sessionStorage.getItem("height"));
    console.log(canvas.getAttribute("width"),sessionStorage.getItem("width"));
    let cDiv = document.getElementById("color");
    if(cDiv.getBoundingClientRect().width<canvas.getAttribute("width")){
      cDiv.classList.remove("canv");
    }
  });
  
  
  
  if(!touchDevice){
    onmousemove = async function (e) {
      mvCurs(e.clientX,e.clientY,mouseX,mouseY);
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    document.getElementById("moveable").addEventListener("mousedown", async function(){
      moving=true;
      await move(this);
      moving=false;
    });
    onmousedown = event => {
      if (event.defaultPrevented) {
        return;
      }
    
      if (event.button == 0&&!moving) {
        if (tool == "pencil"||tool=="moveView") {
          mousePressed = true;
        }
        if (tool == "bucket"&&!movePressed) {
          bucket(color, mouseX, mouseY);
        }
      }
      console.log(event.button);
      
    };
    onmouseup = event => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.button == 0) {
        mousePressed = false;
        sliderMoving = false;
        movePressed = false;
      }
    };
    document.addEventListener('wheel', function (event) {
      if (tool == "pencil") {
        if (event.deltaY > 0) {
          if (size > 1) {
            size--;
          }
        } else {
          size++;
        }
      }
    });
  } else {
    document.getElementsByClassName("canv")[0].style.justifyContent="normal";
    document.body.addEventListener("touchstart", (e) => {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      if(!moving){
        mousePressed = true;
      } else {
        mousePressed = false;
      }
      
    });

    document.body.addEventListener("touchend", async (e) => {
      let curX = e.changedTouches[0].clientX;
      let curY = e.changedTouches[0].clientY;
      mvCurs(curX,curY,mouseX,mouseY);
      mouseX = curX;
      mouseY = curY;
      sendData(curX,curY,"mobile",tool);
      if (tool == "bucket"&&!movePressed) {
        bucket(color, mouseX, mouseY);
      }
      mousePressed = false;
      movePressed = false;
    });
    document.body.addEventListener("touchmove", (e) => {
      mvCurs(e.touches[0].clientX,e.touches[0].clientY,mouseX,mouseY);
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    });
    function preventDefault(e) {
      if(tool!="moveView"||moving){
        e.preventDefault();
      }
    }
    var supportsPassive = false;
    try {
      window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; } 
      }));
    } catch(e) {}
    var wheelOpt = supportsPassive ? { passive: false } : false;
    window.addEventListener('touchmove', preventDefault, wheelOpt);
    document.getElementById("moveable").addEventListener("touchstart", async function(e){
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      moving=true;
      
      await move(this);
      moving=false;
    });
  }
  
  window.addEventListener("beforeunload", (event) => { 
    sendCommand(JSON.stringify({
      "unload":req,
      "path":window.location.pathname
    }));
    saveImage();
  });

});