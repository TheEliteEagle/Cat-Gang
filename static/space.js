
window.onload = function() {

  console.log("hello");


  let scrollSize = 0.2;



  var parent = document.getElementById("canvas");

  var canvas = document.createElement('canvas');
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;;
  parent.appendChild(canvas);
  var ctx = canvas.getContext('2d');


  let objects = [];
  objects.push(makeObject("Earth", "static/earth.jpg", 0, canvas.height, 0.5));
  objects.push(makeObject("Moon", "static/moon.jpg", 500, canvas.height, 0.5));

  console.log(ctx, objects);

  setTimeout(() => {
    drawObjects(ctx, objects);
  }, 1000)


  canvas.addEventListener("click", event => {

    console.log(event);

    // transform point
    const transform = ctx.getTransform();
    const x = event.offsetX - transform.e;
    const y = event.offsetY - transform.f;

    // find which object was clicked
    let any = false;
    objects.forEach(obj => {
      // if the x,y is in this object;
      if (obj.x <= x &&
        obj.y <= y &&
        x <= obj.x + obj.width &&
        y <= obj.y + obj.height) {
        onClick(obj, ctx);
        any = true;
        // dont worry about multiple objects being clicked at the same time
        // because they should be far enough apart
      }
    });

    if (any){
      drawObjects(ctx, objects);
    }
  })

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();

    let dx = event.wheelDeltaX * scrollSize;
    let dy = event.wheelDeltaY * scrollSize;


    // clear the canvas to re-draw

    clear(ctx);

    ctx.translate(dx, dy);
    drawObjects(ctx, objects);
  });


}


function makeObject(name, src, x, HEIGHT, scale = 1) {
  let obj = {}

  let image = new Image();
  image.src = src;


  obj.name = name;
  obj.x = x;


  // centralise in the y direction



  // have object size (used for clicking) seperate from image size
  // so we can scale the image



  // we dont need this if the actual images have transparency just do: 
  // obj.img = image;
  image.onload = function() {
    obj.width = image.width * scale;
    obj.height = image.height * scale;
    obj.y = (HEIGHT- obj.height) / 2;

    // make all (almost) white pixels transparent
    const THRESHOLD = 240;

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

  return obj;
}


function clear(ctx){

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
  objects.forEach(obj => {
    // console.log(obj.img)
    ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height); //obj.img.width, obj.img.height);
  })

}

// called when a planet is clicked
function onClick(object, ctx) {



  // set scale so that the object fills the screen
  //
  let ratioX = ctx.canvas.width / object.width;
  let ratioY = ctx.canvas.height / object.height;

  let ratio = Math.max(ratioX, ratioY);

  // let tx = object.x;


  // translate by -current - center


    

  // let ty = object.y;

  // how do we do this smoothly??
  // identity martix
  let currentTransform = ctx.getTransform();
  let cx = object.width/2; 
  let cy = object.height/2;

  let tx  = cx + (ctx.canvas.width - obj.width*ratio)/2;
  let ty  = cy + (ctx.canvas.height - obj.height*ratio)/2;



  // new matrix for transform of tx,ty then scale of s is:
  // s 0 tx
  // 0 s ty
  // 0 0 1
  let M1 = new DOMMatrix([ratio, 0, 0, ratio, cx, -cy]); // translate and scale about origin
  let M2 = new DOMMatrix([1, 0, 0, 1, tx, ty]); // move to right place
  
  let newTransform = M1 * M2;
  console.log(M1);
  console.log(M2);

  // let newTransform = new DOMMatrix([ratio, 0, 0, ratio, tx, ty]);


  // ctx.setTransform(newTransform); 

  console.log(currentTransform, newTransform, ctx.getTransform());



}

