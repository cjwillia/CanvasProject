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
var HEIGHT = 800;


function initializeGameInfo(){
	var gameInfo = new Object();
	gameInfo.timer = 300;
	gameInfo.currentRemaining = 1000;
	gameInfo.projectiles = [];
	gameInfo.bubbles = [];
	gameInfo.currents = [];
	return gameInfo;
}

//Initialization function
function init(){
	gameInfo = initializeGameInfo();
	redrawAll();
}

function onKeyDown(event){
	//r is for reset
	var keyCode = event.keyCode;
	if(keyCode === 82){
		init();
	}
}

function onMouseDown(event){
	//start drawing the current or start creating the current, however we want it implemented.
	var x = event.pageX - canvas.offsetLeft;
	var y = event.pageY - canvas.offsetTop;
	var newCurr = new Object();
	newCurr.sourceCoords = [x,y];
	newCurr.ready = false;
	currentIndex = gameInfo.currents.push(newCurr) - 1;
	console.log("Mouse Down: " + x + ", " + y);
}

//distance helper
function lineDistance(x, y, x0, y0){
	return Math.abs(Math.sqrt((x -= x0) * x + (y -= y0) * y));
}

function onMouseUp(event){
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

function onTimer(){
	//update the motion of the bubbles/projectiles
	//definitely redraw everything
	updateBubbles();
	updateProjectiles();
	if(gameInfo.timer != 0){
		gameInfo.timer -= 1;
	}
	redrawAll();
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
  ctx.fillText("Air Left",10,38);
  //Create progress bar
  ctx.fillStyle = "#1826B0"
  ctx.fillRect(10,10,90,10);
}

function redrawAll(){
	ctx.clearRect(0, 0, 400, 800);
	drawCurrents();
	drawBubbles();
	drawProjectiles();
	drawTimer();
}

function run(){
	canvas.addEventListener('keydown', onKeyDown, false);
	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
	canvas.setAttribute('tabindex', 0);
	canvas.focus();
	intervalId = setInterval(onTimer, timerDelay);
	init();
}

run();