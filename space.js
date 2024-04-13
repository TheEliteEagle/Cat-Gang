
window.onload = function() {

  console.log("hello");

  // let img = new Image();
  // img.onload = function() {
  //   ctx.drawImage(img, 10, 10);
  // };
  // img.src = 'earth.jpg';

  let scrollSize = 0.2;


  let objects = [];
  objects.push(makeObject("Earth", "earth.jpg", 0, 0, 0.25));
  objects.push(makeObject("Moon", "moon.jpg", 200, 50, 0.1));


  var parent = document.getElementById("canvas");

  var canvas = document.createElement('canvas');
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;;
  parent.appendChild(canvas);
  var ctx = canvas.getContext('2d');



  console.log(ctx, objects);

  setTimeout(()=>{

  drawObjects(ctx, objects);
  }, 100)


  canvas.addEventListener("click", event => {

    console.log(event);

    // transform point
    const transform = ctx.getTransform();
    const x = event.offsetX - transform.e;
    const y = event.offsetY - transform.f;

    // find which object was clicked
    let target = null;
    objects.forEach(obj => {

      // if the x,y is in this object;

      if (obj.x <= x &&
        obj.y <= y &&
        x <= obj.x + obj.width &&
        y <= obj.y + obj.height) {
        target = obj;
      }
    });
    console.log(target);
  })

  document.addEventListener("wheel", (event) => {

    let dx = event.wheelDeltaX * scrollSize;
    let dy = event.wheelDeltaY * scrollSize;




    // clear the canvas to re-draw

    // Store the current transformation matrix
    ctx.save();

    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Restore the transform
    ctx.restore();


    ctx.translate(dx, dy);
    drawObjects(ctx, objects);
  });


}


function makeObject(name, src, x, y, scale = 1) {
  let obj = {}

  let img = new Image();
  img.src = src;
  obj.img = img;


  obj.name = name;
  obj.x = x;
  obj.y = y;


  // have object size (used for clicking) seperate from image size
  // so we can scale the image
  img.onload = function() {
    obj.width = img.width * scale;
    obj.height = img.height * scale;
  }


  return obj;
}

function drawObjects(ctx, objects) {
  objects.forEach(obj => {
    ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height); //obj.img.width, obj.img.height);
  })

}


