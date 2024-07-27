const MIN_SIZE = 15;
const MAX_SIZE = 40;
const MAX_SPEED = 2;
const NEW_OBJECT_INTERVAL = 30;
const DELTA_RADS = 0.0005;
const MAX_X_DIST = 1.5;
const COLOR_ARRAY = ["#bb0d0d", "#830909", "#a80c0c", "#cf5656", "#d10056", "#7d0034", "#d61a67", "#ed99bb"];

let canvas;
const randomIntFromInterval = (min, max) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const renderHearts = () => {
  canvas = document.getElementById("hero-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let context = canvas.getContext("2d");
  const droppingObjects = [];
  const createNewObject = () => {
    const object = {};
    const xPosition = randomIntFromInterval(MAX_SIZE, canvas.width - MAX_SIZE);
    object.position = [xPosition, 0]; // 0 because we start at the top
    object.color = COLOR_ARRAY[randomIntFromInterval(0, COLOR_ARRAY.length - 1)];
    // Speed is per interval you go down x amount of pixels
    object.speed = randomIntFromInterval(1, MAX_SPEED);
    object.size = randomIntFromInterval(MIN_SIZE, MAX_SIZE);
    object.currRads = Math.random() * 2.2 - 1.1;
    return object;
  };

  const moveDown = () => {
    const removals = [];
    for (let i = 0; i < droppingObjects.length; i++) {
      const object = droppingObjects[i];
      object.position[1] += object.speed / 2;

      //   calc x position
      let dRads = DELTA_RADS;
      if (Math.sin(object.currRads * Math.PI) > 1) {
        dRads = -dRads;
        object.currRads += dRads;
        object.position[0] += MAX_X_DIST * Math.sin(object.currRads * Math.PI);
      } else if (Math.sin(object.currRads * Math.PI) < -1) {
        dRads = -dRads;
        object.currRads += dRads;
        object.position[0] += MAX_X_DIST * Math.sin(object.currRads * Math.PI);
      } else {
        object.currRads += dRads;
        object.position[0] += MAX_X_DIST * Math.sin(object.currRads * Math.PI);
      }

      //   object.position[0] += (Math.random() * object.speed) / 4;

      context.font = `bold ${object.size}px "Font Awesome 6 Free"`;
      context.fillStyle = object.color;
      context.fillText("\uf004", object.position[0], object.position[1]);

      if (object.position[1] - object.size > canvas.height) {
        removals.push(i);
      }
    }
    for (let i = 0; i < removals.length; i++) {
      droppingObjects.splice(removals[i], 1);
    }
  };

  let counter = 0;

  fallTimer = setInterval(function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    if (counter % NEW_OBJECT_INTERVAL == 0) {
      const newObject = createNewObject();
      droppingObjects.push(newObject);
      counter = 0;
    }
    counter++;
    moveDown();
  }, 10);
};

// document.addEventListener("load", renderHearts);
document.fonts.ready.then((_) => {
  window.onload = renderHearts;
});

window.addEventListener("resize", resizeCanvas, false);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
