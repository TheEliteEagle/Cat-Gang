

var totalScroll = 0;
var zoomThresholds = [[0, 1], [1300, 1], [1500, 3], [1700, 1],
[3300, 1], [3500, 2], [3700, 1],
[5300, 1], [5500, 0.5], [5700, 1]];

const MAX_SCROLL = 7000;

window.onload = function() {


  let scrollSize = 0.5;


  var parent = document.getElementById("canvas");

  var canvas = document.createElement('canvas');
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;;
  parent.appendChild(canvas);
  var ctx = canvas.getContext('2d');


  let objects = [];
  objects.push(makeObject("Earth", "static/earth.jpg", 0, 1));
  objects.push(makeObject("Moon", "static/moon.jpg", 2000, 0.5));
  objects.push(makeObject("Mars", "static/moon.jpg", 4000, 1));
  objects.push(makeObject("Jupiter", "static/moon.jpg", 6000, 3));

  console.log(ctx, objects);

  setTimeout(() => {
    drawObjects(ctx, objects);
  }, 1000)


  canvas.addEventListener("click", event => {

    // transform point
    const transform = ctx.getTransform();
    const x = event.offsetX - transform.e;
    const y = event.offsetY - transform.f - ctx.canvas.height / 2;

    console.log(x, y)
    let zoom = getCurrentZoom();

    // find which object was clicked
    let any = false;
    objects.forEach(obj => {
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

    if (any) {
      drawObjects(ctx, objects);
    }
  })

  document.addEventListener("wheel", (event) => {
    event.preventDefault();

    let dx = -event.wheelDeltaY * scrollSize;
    // let dy = event.wheelDeltaY * scrollSize;
    //
    totalScroll -= dx; // rightward scroll is negative



    objects.forEach(obj => {
      let left = parseInt(obj.div.style.left);

      left += dx;
      obj.div.style.left = left + "px";


      if (left < -obj.div.offsetWidth || left > ctx.canvas.width) {
        // outside the screen
        obj.div.style.display = "none";
      } else {
        //fade in out

        obj.div.style.display = "block";

        let t = (left + obj.div.offsetWidth / 2) / ctx.canvas.width;
        // quadratic with intercepts at 0 and 1 peak at 0.5,1
        obj.div.style.opacity = -4 * t * (t - 1);


      }


    })




    // clear the canvas to re-draw

    clear(ctx);


    ctx.translate(dx, 0);




    drawObjects(ctx, objects);
  });


  window.onresize = function(event) {
    console.log("resizing");
    ctx.save();
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.restore();
    clear(ctx);
    drawObjects(ctx, objects);
  };


}

function getCurrentZoom() {


  for (let i = 1; i < zoomThresholds.length; i++) {
    if (totalScroll < zoomThresholds[i][0]) {

      let start = zoomThresholds[i - 1][1];
      let end = zoomThresholds[i][1];

      let t = (totalScroll - zoomThresholds[i - 1][0]) / (zoomThresholds[i][0] - zoomThresholds[i - 1][0]);

      t = Math.min(1, t);
      t = Math.max(0, t);

      return start + (end - start) * t;

    }
  }

  // bigger than all thresholds
  // shoudl we limit the scroll??
  return zoomThresholds[zoomThresholds.length - 1][1];


}

function makeObject(name, src, x, scale = 1) {
  let obj = {}

  let image = new Image();
  image.src = src;


  obj.name = name;
  obj.x = x;


  // we dont need this if the actual images have transparency just do: 
  // obj.img = image;
  image.onload = function() {
    obj.width = image.width * scale;
    obj.height = image.height * scale;
    obj.y = 0; //(HEIGHT- obj.height) / 2;

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


    img.onload = function() {
      // create the div for the info
      let div = document.createElement("div");
      div.className = "info-planet";
      div.id = "info-" + name;
      div.style.left = (obj.x + img.width) + "px";
      div.style.top = "100px";
      document.body.appendChild(div);
      obj.div = div;
    }


  }

  return obj;
}


function clear(ctx) {

  // Store the current transformation matrix
  ctx.save();

  // Use the identity matrix while clearing the canvas
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // ctx.fillStyle = "black"; // space is black
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Restore the transform
  ctx.restore();
}

function drawObjects(ctx, objects) {

  let zoom = getCurrentZoom();



  objects.forEach(obj => {
    // console.log(obj.img)
    let x = obj.x - obj.width * zoom / 2;
    let y = obj.y - obj.height * zoom / 2 + ctx.canvas.height / 2;
    ctx.drawImage(obj.img, x, y, obj.width * zoom, obj.height * zoom); //obj.img.width, obj.img.height);
  })

}

// called when a planet is clicked
function onClick(object, ctx) {



  console.log(object);
}

