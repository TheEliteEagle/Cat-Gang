

var totalScroll = 0;
// var zoomThresholds = [[0, 1], [1300, 1], [1500, 3], [1700, 1],
// [3300, 1], [3500, 2], [3700, 1],
// [5300, 1], [5500, 0.5], [5700, 1]];

var planets = [];

const MAX_SCROLL = 7000;
let scrollSize = 0.5;

window.onload = function() {

  var parent = document.getElementById("canvas");

  var canvas = document.createElement('canvas');
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;; //Max: why 2 ; ?
  parent.appendChild(canvas);
  var ctx = canvas.getContext('2d');


  // make sure these are in order
  makeObject("earth", "static/earth.jpg", 150, 1, 1, 100, 0);
  makeObject("moon", "static/moon.jpg", 2000, 3, 0.5, 0, 0);
  makeObject("mars", "static/moon.jpg", 4000, 1.5, 1, 0, 0);
  makeObject("jupiter", "static/moon.jpg", 6000, 0.5, 3, 0, 0);

  setTimeout(() => {
    drawPlanets(ctx);
  }, 500);


  canvas.addEventListener("click", event => {

    // transform point
    const transform = ctx.getTransform();
    const x = event.offsetX - transform.e;
    const y = event.offsetY - transform.f - ctx.canvas.height / 2;

    let zoom = getCurrentZoom();

    // find which object was clicked
    let any = false;
    planets.forEach(obj => {
      // if the x,y is in this object;
      if (obj.x - obj.width * zoom / 2 <= x &&
        obj.y - obj.height * zoom / 2 <= y &&
        x <= obj.x + obj.width * zoom / 2 &&
        y <= obj.y + obj.height * zoom / 2) {
        onClick(obj, ctx);
        any = true;
        // dont worry about multiple objects being clicked at the same time
        // because they should be far enough apart
      }
    });
  })

  document.addEventListener("wheel", (event) => {
    event.preventDefault();
    let dx = -event.wheelDeltaY * scrollSize;

    totalScroll -= dx; // rightward scroll is negative
    //console.log(totalScroll);

    // clear the canvas to re-draw
    clear(ctx);

    ctx.translate(dx, 0);
    drawPlanets(ctx, dx);
  });


  window.onresize = function(event) {
    console.log("resizing");
    ctx.save();
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.restore();
    clear(ctx);
    drawPlanets(ctx);
  };

  
  //Max: avoid visual bug at start by redrawing after load
  clear(ctx); 
  
  
}

function getCurrentZooms(ctx) {

  let zooms = [];
  let ts = [];

  let boundSize = ctx.canvas.width / 3;
  let middle = ctx.canvas.width / 2;
  let leftBound = middle - boundSize;
  let rightBound = middle + boundSize;

  for (let i = 0; i < planets.length; i++) {

    let x = planets[i].x - totalScroll;

    if (leftBound < x && x < rightBound) {
      // do interpolation

      let start, end, t;
      if (x < middle) {
        start = 1;
        end = planets[i].zoom;

        t = 1 - (middle - x) / boundSize;
        ts.push(1 - t);

      } else {
        start = planets[i].zoom;
        end = 1;

        t = (x - middle) / boundSize;
        ts.push(t);
      }

      let z = start + (end - start) * t
      zooms.push(z);

    } else {
      zooms.push(1);
      ts.push(null);
    }
  }
  return [zooms, ts];
}

function makeObject(name, src, x, zoom = 1, scale = 1, divRelLeft, divRelTop) {
  let obj = {
    name: name,
    x: x,
    y: 175, //Max: object lower gives more space for chat box
    zoom: zoom, // the extra zoom to add when focused
    // scale is the scaling of image file to unfocused size
  }
  
  let div = document.createElement("div");
    div.className = "info-planet";
    div.id = "info-"+obj.name;
    div.style.opacity = 0; //Max: so doesnt appear at start
    div.innerHTML = `<div class="chatbox">
            <div class="messages" id="messageBox_${obj.name}">

            </div>

            <div class="user_input">
                <form action="javascript:;" onsubmit="handleSubmit('${obj.name}')">
                    <input type="text" id="user_input_${obj.name}" name="user_input"><br>
                </form>
            </div>
        </div>
        `;

      document.body.appendChild(div);

    obj.relLeft = divRelLeft; //(obj.x - div.offsetWidth/2 + divRelLeft) +"px";
    
    // let left = obj.x + ctx.getTransform().e;
    // obj.div.style.left = left + "px";
    div.style.top = (125 + divRelTop) + "px";

    obj.div = div;



  // add the image
  let image = new Image();
  image.src = src;
  // if the image transparency is good we dont need this;
  image.onload = function() {
    obj.width = image.width * scale;
    obj.height = image.height * scale;

    // make all (almost) white pixels transparent
    const THRESHOLD = 230;

    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    var tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(image, 0, 0);

    var imgData = tempCtx.getImageData(0, 0, image.width, image.height);
    var pixels = imgData.data;

    for (var i = 3; i < pixels.length; i += 4) {
      if (pixels[i - 3] >= THRESHOLD &&
        pixels[i - 2] >= THRESHOLD &&
        pixels[i - 1] >= THRESHOLD) {
        pixels[i] = 0;
      }
    }
    imgData.data = pixels;
    tempCtx.putImageData(imgData, 0, 0);

    let img = new Image();
    img.src = tempCanvas.toDataURL();
    obj.img = img;
  }
  planets.push(obj);
}


function clear(ctx) {
  // Store the current transformation matrix
  ctx.save();

  // Use the identity matrix while clearing the canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  //Max: space colour background, could replace with image?
  ctx.fillStyle = '#1A102A';
  ctx.fillRect(0,0, ctx.canvas.width, ctx.canvas.height);

  // ctx.fillStyle = "black"; // space is black
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Restore the transform
  ctx.restore();
}

function drawPlanets(ctx, dx = 0) {
  let [zooms, ts] = getCurrentZooms(ctx);

  for (let i = 0; i < planets.length; i += 1) {
    // console.log(obj.img)
    let obj = planets[i];
    let zoom = zooms[i];
    let w = obj.width*zoom;
    let h = obj.height*zoom;
    let x = obj.x - w/2;
    let y = obj.y - h/2; 
    ctx.drawImage(obj.img, x, y, w, h); //obj.img.width, obj.img.height);

    // update divs
    // let left = parseInt(obj.div.style.left);
    // left += dx;

    let left = obj.x + ctx.getTransform().e - w/2 + obj.relLeft; // - obj.img.width/2 - obj.div.offsetWidth/2;


    obj.div.style.left = left + "px";
    if(i==0){
      console.log(ctx.getTransform().e, left);
    }


    if (ts[i] == null) {
      // outside the screen
      obj.div.style.display = "none";
    } else {
      //fade in out

      obj.div.style.display = "block";
      let t = ts[i];
      
      // Max: added so is at full opacity for a range not a point- easier use
      if(t< 0.5) {
        obj.div.style.opacity = 1
      } else {
        obj.div.style.opacity = 2 - 2*t;
      }

      if(t<0.2) {
        scrollSize = 0.06;
      }
      else {
        scrollSize = 0.5;
      }
    }

  }
}

// called when a planet is clicked
function onClick(object, ctx) {
  console.log(object);
}

