var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var gameInfo;

var intervalId;
var timerDelay = 100;

//Index of the current current. (confusing)
var currentIndex = -1;

//Time counters for object spawning that actually always have similar values now that I think of it.
var projectileCounter = 0;
var bubbleCounter = 0;

//Constants

//The lower the threshold, the more often it spawns.
var PROJECTILE_SPAWN_TRESHOLD = 20;
var BUBBLE_SPAWN_THRESHOLD = 30;

//Letters for the bubbles
var LETTERS = ["H", "E", "L", "P"];

//Width, Height
var WIDTH = 400;
var HEIGHT = 600;

//Initial time
var TIMER_INITIAL=300;

//STATE, 1=menu, 2=already in menu, 3=game, 4=already in game, 5=game over, 6=game over
var STATE=1;


//---------------------------SCREEN:MENU
//######################################

function onMouseUpMenu(event)
{
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  console.log("x:"+x+" y:"+y);
  //if box1
  if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3) && y<=(HEIGHT*.3+80)) {
    STATE=3;
  }
  //else if box2
  else if(x>=(WIDTH*.25) &&x<=(WIDTH*.75)&&y>=(HEIGHT*.3+100) && y<=(HEIGHT*.3+180)){
    STATE=5;
  }
}
function drawMenuTitle(){
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("Drowning!",WIDTH*.5, HEIGHT*.2);
}

function drawMenuBackground(){ //eventually want to use a pattern for this
  ctx.fillStyle = "blue";
  ctx.fillRect(0,0, WIDTH, HEIGHT);
}

function drawMenuButtons(){
  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  //button1
  ctx.fillStyle="white";
  roundedRect(ctx,WIDTH*.25,HEIGHT*.3,WIDTH*.5,80,15);
  ctx.fillStyle="black";
  ctx.fillText("Start",WIDTH*.5, HEIGHT*.3+50);
  //button2
  ctx.fillStyle="#ffffff";
  roundedRect(ctx,WIDTH*.25,HEIGHT*.3+100,WIDTH*.5,80,15);
  ctx.fillStyle="black";
  ctx.fillText("End",WIDTH*.5, HEIGHT*.3+150);
}
function initMenu() {
  drawMenuBackground();
  drawMenuTitle();
  drawMenuButtons();
}

//---------------------------SCREEN:GAME
//######################################
function initializeGameInfo(){
  var gameInfo = new Object();
  gameInfo.timer = TIMER_INITIAL;
  gameInfo.currentRemaining = 1000;
  gameInfo.projectiles = [];
  gameInfo.bubbles = [];
  gameInfo.currents = [];
  return gameInfo;
}

function onMouseDownGame(event)
{
  //start drawing the current or start creating the current, however we want it implemented.
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  var newCurr = new Object();
  newCurr.sourceCoords = [x,y];
  newCurr.ready = false;
  currentIndex = gameInfo.currents.push(newCurr) - 1;
  console.log("Mouse Down: " + x + ", " + y);
}

function initGame(){
  gameInfo = initializeGameInfo();
  redrawAllGame();
}

function redrawAllGame(){
  ctx.clearRect(0, 0, 400, 800);
  drawCurrents();
  drawBubbles();
  drawProjectiles();
  drawTimer();
}


function drawCurrents(){
  gameInfo.currents.forEach(function(e){
    if(e.ready){
      ctx.beginPath();
      ctx.moveTo(e.sourceCoords[0], e.sourceCoords[1]);
      ctx.lineTo(e.destCoords[0], e.destCoords[1]);
      ctx.closePath();
      ctx.stroke();
    }
  });
}

function drawBubbles(){
  gameInfo.bubbles.forEach(function(e){
    ctx.beginPath();
    ctx.arc(e.position[0], e.position[1], 20, 0, 2*Math.PI, true);
    ctx.closePath();
    ctx.stroke();
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(e.letter, e.position[0], e.position[1]+12);
  });
}

function drawProjectiles(){
  gameInfo.projectiles.forEach(function(e){
    ctx.beginPath();
    var size = 30;
    ctx.fillStyle = "red";
    ctx.fillRect(e.position[0]-size, e.position[1]-size, size*2, size*2);
  });
}

function drawTimer(){
  //Create number
  ctx.beginPath();
  ctx.font = "15px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.fillText("Air",10,30);
  //ctx.fillText(gameInfo.timer + "", 40, 40);

  //Create progress bar
  ctx.fillStyle = "#1826B0" //blue
  ctx.fillRect(10, 5,WIDTH*.9*(gameInfo.timer/TIMER_INITIAL),10);
}

function addBubble(){
  var bubble;
  bubble = new Object();
  bubble.letter = LETTERS[Math.floor(Math.random()*4)];
  bubble.position = [Math.floor(Math.random()*WIDTH + 1), HEIGHT];
  gameInfo.bubbles.push(bubble);
  console.log("bubble added")
}

function updateAndRemoveBubbles(){
  var toRemove = [];
  gameInfo.bubbles.forEach(function(e, i){
    e.position[1] = e.position[1] - 5;
    if(e.position[1] <= 0){
      toRemove.push(i);
    }
  });
  toRemove.forEach(function(e){
    gameInfo.bubbles.splice(e, 1);
  });
}

function updateBubbles(){
  if(Math.floor(Math.random()*2 + 1) % 2 === 0){
    bubbleCounter++;
    if(bubbleCounter % BUBBLE_SPAWN_THRESHOLD === 0){
      addBubble();
    }
  }
  updateAndRemoveBubbles();
}

function onMouseUpGame(event){
  //stop drawing the current
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  var c = gameInfo.currents[currentIndex]
  var drawDistance = Math.floor(lineDistance(c.sourceCoords[0], c.sourceCoords[1], x, y));

  if(drawDistance < gameInfo.currentRemaining && drawDistance != 0){
    c.destCoords = [x,y];
    gameInfo.currentRemaining -= drawDistance;
    c.ready = true;
  }
  else{
    gameInfo.currents.splice(currentIndex, 1);
  }
  currentIndex = -1;
}

function addProjectile(){
  var proj = new Object();
  proj.speed = Math.floor(Math.random()*5 + 1);
  proj.position = [Math.floor(Math.random()*WIDTH + 1), -50];
  gameInfo.projectiles.push(proj);
  console.log("projectile added.");
}

function updateAndRemoveProjectiles(){
  var toRemove = [];
  gameInfo.projectiles.forEach(function(e, i){
    e.position[1] = e.position[1] + e.speed;
    if(e.position[1] >= HEIGHT + 100){
      toRemove.push(i);
    }
  });
  toRemove.forEach(function(e){
    gameInfo.projectiles.splice(e, 1);
  });
}

function updateProjectiles(){
  if(Math.floor(Math.random()*2 + 1) % 2 === 0){
    projectileCounter++;
    if(projectileCounter % PROJECTILE_SPAWN_TRESHOLD === 0){
      addProjectile();
    }
  }
  updateAndRemoveProjectiles();
}

function updateGame(){
  updateBubbles();
    updateProjectiles();
    if(gameInfo.timer != 0){
      gameInfo.timer -= 1;
    }
    redrawAllGame();
}
//---------------------------SCREEN:END
//#####################################
function initEndScreen(){
  ctx.clearRect(0, 0, 400, 800);
  ctx.font = "50px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "black";
  ctx.fillText("END OF GAME",WIDTH*.5, HEIGHT*.2);
}

//---------------------------MISCELLANEOUS METHODS
////##############################################

function roundedRect(ctx,x,y,width,height,radius){
    ctx.beginPath();
    ctx.moveTo(x,y+radius);
    ctx.lineTo(x,y+height-radius);
    ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
    ctx.lineTo(x+width-radius,y+height);
    ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
    ctx.lineTo(x+width,y+radius);
    ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
    ctx.lineTo(x+radius,y);
    ctx.quadraticCurveTo(x,y,x,y+radius);
    ctx.fill();
}

//distance helper
function lineDistance(x, y, x0, y0){
  return Math.abs(Math.sqrt((x -= x0) * x + (y -= y0) * y));
}

//---------------------------EVENT LISTENERS
//##########################################
function onKeyDown(event){ //todo:update with switch statement depending on STATE 
  //r is for reset
  var keyCode = event.keyCode;
  if(keyCode === 82){
    initGame();
  }
}


function onMouseDown(event){
  switch(STATE) {
  case 1: //initialize menu
    break;
  case 2: //currently in menu
    break;
  case 3: //initialize game
    break;
  case 4: //currently in game
    onMouseDownGame(event);
    break;
  case 5: //initialize end screen
    break;
  case 6: //currently in end screen
    break;
  }
}

function onMouseUp(event){
  switch(STATE) {
  case 1: //initialize menu
    break;
  case 2: //currently in menu
    onMouseUpMenu(event);
    break;
  case 3: //initialize game
    break;
  case 4: //currently in game
    onMouseUpGame(event);
    break;
  case 5: //initialize end screen
    break;
  case 6: //currently in end screen
    break;
  }
}
//---------------------------INITIAL SETUP
//########################################
function onTimer(){
  switch(STATE) {
  case 1: //initialize menu
    initMenu();
    STATE=2;
    break;
  case 2: //currently in menu (not used, if we do a start animation, then we will need it)
    break; 
  case 3: //initialize game
    initGame();
    STATE=4;
    break;
  case 4: //currently in game
    updateGame();
    break;
  case 5: //initialize end screen
    initEndScreen();
    STATE=6;
    break;
  case 6: //currently in end screen
    break;
  }
}

function run(){
  canvas.addEventListener('keydown', onKeyDown, false);
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.setAttribute('tabindex', 0);
  canvas.focus();
  intervalId = setInterval(onTimer, timerDelay);
}

run();