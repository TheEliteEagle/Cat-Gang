
window.onload = function(){

  console.log("hello");

  let img = new Image();
  img.onload = function() {
    ctx.drawImage(img, 10, 10);
  };
  img.src = 'earth.jpg';

  var parent = document.getElementById("canvas");

  var canvas = document.createElement('canvas');
  parent.appendChild(canvas);
  var ctx = canvas.getContext('2d');


  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 150, 75);
}
