

var totalScroll = 0;
// var zoomThresholds = [[0, 1], [1300, 1], [1500, 3], [1700, 1],
// [3300, 1], [3500, 2], [3700, 1],
// [5300, 1], [5500, 0.5], [5700, 1]];

var planets = [];

const MAX_SCROLL = 7000;
let scrollSize = 0.5;

window.onload = function() {

  speechSynthesis.getVoices().forEach(function(voice) {
    console.log(voice.name, voice.default ? voice.default :'');
  });
  

  var parent = document.getElementById("canvas");

  var canvas = document.createElement('canvas');
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;; //Max: why 2 ; ?
  parent.appendChild(canvas);
  var ctx = canvas.getContext('2d');


  let width = ctx.canvas.width / 3;
  // make sure these are in order
  makeObject("sun", -6000, 1.3, 0.23, 0, 0, 0, -width + 175, 0) //333,000
  makeObject("mercury", -4000, 1.8, 0.05, 0, 0, 0, -width -200, 0) //0.055
  makeObject("venus", -2000, 1.6, 0.08, 0, 0, 0, -width -175, 0) //0.8
  makeObject("earth", 0, 1.4, 0.1, 0, 0, 0, -width -175, 0);
  makeObject("moon", 2000, 1.75, 0.05, 0, 0, 0, -width -200, 0); //0.25
  makeObject("mars", 4000, 1.5, 0.08, 0, 0, 0, -width -150, 0); //0.1
  makeObject("jupiter", 6000, 1.5, 0.16, 0.35, -1200, -200, -width, 0); //11
  makeObject("saturn", 8000, 1.4, 0.18, 0, 0, 0, -width, 0); //95
  makeObject("uranus", 10000, 1.4, 0.1, 0, 0, 0, -width, 0); //14.5
  makeObject("neptune", 12000, 1.5, 0.09, 0, 0, 0, -width -100, 0); //17
  makeObject("pluto", 14000, 1.2, 0.06, 0, 0, 0, -width -300, 0); //0.2

  setTimeout(() => {
    drawPlanets(ctx);
  }, 500);


  canvas.addEventListener("click", event => {

    // // transform point
    // const transform = ctx.getTransform();
    // const x = event.offsetX - transform.e;
    // const y = event.offsetY - transform.f - ctx.canvas.height / 2;
    //
    // let zoom = getCurrentZoom();
    //
    // // find which object was clicked
    // let any = false;
    // planets.forEach(obj => {
    //   // if the x,y is in this object;
    //   if (obj.x - obj.width * zoom / 2 <= x &&
    //     obj.y - obj.height * zoom / 2 <= y &&
    //     x <= obj.x + obj.width * zoom / 2 &&
    //     y <= obj.y + obj.height * zoom / 2) {
    //     onClick(obj, ctx);
    //     any = true;
    //     // dont worry about multiple objects being clicked at the same time
    //     // because they should be far enough apart
    //   }
    // });
  })

  document.addEventListener("wheel", (event) => {
    event.preventDefault();
    let dx = -event.wheelDeltaY * scrollSize;

    totalScroll -= dx; // rightward scroll is negative

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
  let middle = ctx.canvas.width * 3 / 4; // middle of slow section in window 
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

function makeObject(name, x, zoom = 1, scale = 1, alien_scale = 1, alienRelX, alienRelY, divRelLeft, divRelTop) {
  scale = scale * 1.6;
  zoom = zoom * 1.6;
  let obj = {
    name: name,
    x: x,
    y: 0,
    zoom: zoom, // the extra zoom to add when focused
    // scale is the scaling of image file to unfocused size

    alienX: alienRelX,
    alienY: alienRelY,
  }
  let src = `static/${name}.png`;
  let alien_src = `static/${name}_alien.png`;

  let div = document.createElement("div");
  div.className = "info-planet";
  div.id = "info-" + obj.name;
  div.style.opacity = 0; //Max: so doesnt appear at start
  div.innerHTML = `<div class="chatbox">
            <div class="messages" id="messageBox_${obj.name}">

            </div>

            <div class="user_input">
                <form action="javascript:;" onsubmit="handleSubmit('${obj.name}')">
            <input type="text" id="user_input_${obj.name}" placeholder = "Ask me anything..." autocomplete="off" name="user_input"><br>
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


  // add the planet image
  obj.alien_img = new Image();
  obj.alien_img.src = alien_src;
  obj.alien_img.onload = function() {
    obj.alien_width = obj.alien_img.width * alien_scale;
    obj.alien_height = obj.alien_img.height * alien_scale;

  }

  // add the planet image
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
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // ctx.fillStyle = "black"; // space is black
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Restore the transform
  ctx.restore();
}

function drawPlanets(ctx) {
  let [zooms, ts] = getCurrentZooms(ctx);

  for (let i = 0; i < planets.length; i += 1) {
    let obj = planets[i];
    let zoom = zooms[i];
    let w = obj.width * zoom;
    let h = obj.height * zoom;
    let x = obj.x;
    let y = obj.y + ctx.canvas.height / 2;
    ctx.drawImage(obj.img, x - w / 2, y - h / 2, w, h); //obj.img.width, obj.img.height);
    ctx.drawImage(obj.alien_img, x + obj.alienX, y + obj.alienY, obj.alien_width, obj.alien_height); //obj.img.width, obj.img.height);

    // update divs
    // let left = parseInt(obj.div.style.left);
    // left += dx;

    let left = obj.x + ctx.getTransform().e - w / 2 + obj.relLeft; // - obj.img.width/2 - obj.div.offsetWidth/2;
    obj.div.style.left = left + "px";

    if (ts[i] == null) {
      // outside the screen
      obj.div.style.display = "none";
    } else {
      //fade in out

      obj.div.style.display = "block";
      let t = ts[i];

      // Max: added so is at full opacity for a range not a point- easier use
      if (t < 0.5) {
        obj.div.style.opacity = 1
      } else {
        obj.div.style.opacity = 2 - 2 * t;
      }

      if (t < 0.2) {
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

