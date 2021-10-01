// 0 for the game

// 1 for the main menu

// 2 for the settings screen
// 3 for the game over screen
// 3 for the pause screen
const Screens = {game:0,mainMenu:1,settings:2,gameOver:3,pause:4};

const GetCheckedAttr = function(){
	return document.createAttribute("checked");
}


// Canvas & Context
var canvas;
var ctx;

// Snake
var snake;
var snake_dir;
var snake_next_dir;
var snake_speed;
var snake_multicolour;
var currentColour = {r:50,g:129,b:168};
var nextColour = {r:0,g:0,b:0};

// Food
var food = { x: 0, y: 0 };
var foodColour = {r:232,g:30,b:30};

var CurrentScreen;
var IsMainLoopRunning = false;

var usewasd;

var paused;

// Score
const score = {
	get score(){
		return this._data.score;
	},
	set score(scoreVal){
		this._data.score = scoreVal;
		if (this._data.score>this.highScore){
			this._setHighScore(scoreVal);
		}
		ele_high_score.innerHTML = String(this.highScore);
		ele_score.innerHTML = String(scoreVal);
		localStorage.setItem("score",JSON.stringify(this._data));
		
	},
	get highScore(){
		if (wall){
			if (this._data.highScores.wall[snake_speed] == undefined){
				return 0;
			}
			else{
				return this._data.highScores.wall[snake_speed]
			}
		}else{
			if (this._data.highScores.wallless[snake_speed] == undefined){
				return 0;
			}
			else{
				return this._data.highScores.wallless[snake_speed]
			}
		}
	},
	_setHighScore : function(HSVal){
		if (wall){
			this._data.highScores.wall[snake_speed] = HSVal;
		}else{
			this._data.highScores.wallless[snake_speed] = HSVal;
		}
	},
	load : function(data){
		this._data = JSON.parse(data);
	},
	_data:{
		highScores : {
			wall : {
	
			},
			wallless : {
	
			}
		},
		score:0
	}
}

// Wall
var wall;

// HTML Elements
var screen_snake;
var screen_menu;
var screen_setting;
var screen_gameover;
var screen_pause;
var button_newgame_menu;
var button_newgame_setting;
var button_newgame_gameover;
var button_setting_menu;
var button_setting_gameover;
var button_mainMenu_setting;
var button_resume_pause;
var button_newgame_pause;
var button_setting_pause;
var button_mainMenu_pause;
var ele_score;
var ele_high_score;
var speed_setting;
var wall_setting;
var wasd_setting;
var multicolour_setting;

/////////////////////////////////////////////////////////////

const genNextColour = function() {
	return {r:Math.floor(Math.random()*255),g: Math.floor(Math.random()*255),b: Math.floor(Math.random()*255)}
}

/////////////////////////////////////////////////////////////

const activeDot = function (x, y, colour) {
	ctx.fillStyle = "rgb("+colour.r+","+colour.g+","+colour.b+")";
	ctx.fillRect(x * 10, y * 10, 10, 10);
}


/////////////////////////////////////////////////////////////

const changeDir = function (key) {
	if (key == (usewasd?"w":"ArrowUp") && snake_dir != 2) {
		snake_next_dir = 0;
	} else if (key == (usewasd?"d":"ArrowRight") && snake_dir != 3) {
		snake_next_dir = 1;
	} else if (key == (usewasd?"s":"ArrowDown") && snake_dir != 0) {
		snake_next_dir = 2;
	} else if (key == (usewasd?"a":"ArrowLeft") && snake_dir != 1) {
		snake_next_dir = 3;
	}
}


/////////////////////////////////////////////////////////////

const addFood = function () {
	food.x = Math.floor(Math.random() * ((canvas.width / 10) - 1));
	food.y = Math.floor(Math.random() * ((canvas.height / 10) - 1));
	for (var i = 0; i < snake.length; i++) {
		if (checkBlock(food.x, food.y, snake[i].x, snake[i].y)) {
			addFood();
		}
	}
}

/////////////////////////////////////////////////////////////

const checkBlock = function (x, y, _x, _y) {
	return (x == _x && y == _y) ? true : false;
}

/////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////

const mainLoop = function () {
	IsMainLoopRunning = true;

	screen_snake.focus();

	if (paused){
		showScreen(4)
		IsMainLoopRunning = false;
		return;
	}

	var _x = snake[0].x;
	var _y = snake[0].y;
	snake_dir = snake_next_dir;

	// 0 - w, 1 - d, 2 - s, 3 - a
	switch (snake_dir) {
		case 0: _y--; break;
		case 1: _x++; break;
		case 2: _y++; break;
		case 3: _x--; break;
	}

	snake.pop();
	snake.unshift({ x: _x, y: _y });


	// --------------------

	// Wall

	if (wall) {
		// On
		if (snake[0].x < 0 || snake[0].x == canvas.width / 10 || snake[0].y < 0 || snake[0].y == canvas.height / 10) {
			showScreen(3);
			IsMainLoopRunning = false;
			return;
		}
	} else {
		// Off
		for (var i = 0, x = snake.length; i < x; i++) {
			if (snake[i].x < 0) {
				snake[i].x = snake[i].x + (canvas.width / 10);
			}
			if (snake[i].x == canvas.width / 10) {
				snake[i].x = snake[i].x - (canvas.width / 10);
			}
			if (snake[i].y < 0) {
				snake[i].y = snake[i].y + (canvas.height / 10);
			}
			if (snake[i].y == canvas.height / 10) {
				snake[i].y = snake[i].y - (canvas.height / 10);
			}
		}
	}

	// --------------------

	// Autophagy death
	for (var i = 1; i < snake.length; i++) {
		if (snake[0].x == snake[i].x && snake[0].y == snake[i].y) {
			showScreen(3);
			IsMainLoopRunning = false;
			return;
		}
	}

	// --------------------

	// Eat Food
	if (checkBlock(snake[0].x, snake[0].y, food.x, food.y)) {
		snake[snake.length] = { x: snake[0].x, y: snake[0].y };
		score.score += 1.00;
		addFood();
		if (snake_multicolour){
			foodColour = genNextColour();
		}
		activeDot(food.x, food.y, foodColour);
	}

	// --------------------

	ctx.beginPath();
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// --------------------

	for (var i = 0; i < snake.length; i++) {
		activeDot(snake[i].x, snake[i].y, currentColour);
	}
	if (snake_multicolour) {
		if (currentColour.r > nextColour.r){
			currentColour.r -= Math.ceil((currentColour.r - nextColour.r)/20);
		}else if (currentColour.r < nextColour.r){
			currentColour.r += Math.ceil((nextColour.r - currentColour.r)/20);
		}
		if (currentColour.g > nextColour.g){
			currentColour.g -= Math.ceil((currentColour.g - nextColour.g)/20);
		}else if (currentColour.g < nextColour.g){
			currentColour.g += Math.ceil((nextColour.g - currentColour.g)/20);
		}
		if (currentColour.b > nextColour.b){
			currentColour.b -= Math.ceil((currentColour.b - nextColour.b)/20);
		}else if (currentColour.b < nextColour.b){
			currentColour.b += Math.ceil((nextColour.b - currentColour.b)/20);
		}
		
		if (currentColour.r == nextColour.r && currentColour.g == nextColour.g && currentColour.b == nextColour.b){
			nextColour = genNextColour();
		}
	}
	

	// --------------------
	activeDot(food.x, food.y, foodColour);

	// Debug
	//document.getElementById("debug").innerHTML = snake_dir + " " + snake_next_dir + " " + snake[0].x + " " + snake[0].y;    

	setTimeout(mainLoop, snake_speed);
}

/////////////////////////////////////////////////////////////

const newGame = function () {

	paused = false;
	if (snake_multicolour) {
		nextColour = genNextColour();
		foodColour = genNextColour();
	}else{
		currentColour = {r:50,g:129,b:168};
		foodColour = {r:200,g:10,b:0};
	}

	showScreen(0);
	screen_snake.focus();

	snake = [];
	for (var i = 4; i >= 0; i--) {
		snake.push({ x: i, y: 15 });
	}

	snake_next_dir = 1;

	score.score = 0;

	addFood();

	canvas.onkeydown = function (evt) {
		evt = evt || window.event;
		if (!paused){
			changeDir(evt.key);
		}
	}

	if (!IsMainLoopRunning){
		mainLoop();
	}

}

/////////////////////////////////////////////////////////////

// Change the snake speed...
// 150 = slow
// 100 = normal
// 50 = fast
const setSnakeSpeed = function (speed_value) {
	snake_speed = speed_value;
	localStorage.setItem("snake_speed", snake_speed);
}

/////////////////////////////////////////////////////////////
const setWall = function (wall_value) {
	wall = wall_value == 1;
	if (wall) { screen_snake.style.borderColor = "#FFFFFF"; }
	else { screen_snake.style.borderColor = "#606060"; }
	localStorage.setItem("wall", wall);
}

const setWasd = function(wasd_value) {
	usewasd = wasd_value == 1;
	localStorage.setItem("usewasd", usewasd);
}

const setmulticolour = function(multicolour_value){
	snake_multicolour = multicolour_value == 0;
	localStorage.setItem("snake_multicolour", snake_multicolour);
}
/////////////////////////////////////////////////////////////

// 0 for the game
// 1 for the main menu
// 2 for the settings screen
// 3 for the game over screen
// 3 for the pause screen
const showScreen = function (screen_opt) {
	CurrentScreen = screen_opt;
	switch (screen_opt) {

		case Screens.game: screen_snake.style.display = "block";
			screen_menu.style.display = "none";
			screen_setting.style.display = "none";
			screen_gameover.style.display = "none";
			screen_pause.style.display = "none";
			break;

		case Screens.mainMenu: screen_snake.style.display = "none";
			screen_menu.style.display = "block";
			screen_setting.style.display = "none";
			screen_gameover.style.display = "none";
			screen_pause.style.display = "none";
			break;

		case Screens.settings: screen_snake.style.display = "none";
			screen_menu.style.display = "none";
			screen_setting.style.display = "block";
			screen_gameover.style.display = "none";
			screen_pause.style.display = "none";
			break;

		case Screens.gameOver: screen_snake.style.display = "none";
			screen_menu.style.display = "none";
			screen_setting.style.display = "none";
			screen_gameover.style.display = "block";
			screen_pause.style.display = "none";
			break;

		case Screens.pause: screen_snake.style.display = "block";
			screen_menu.style.display = "none";
			screen_setting.style.display = "none";
			screen_gameover.style.display = "none";
			screen_pause.style.display = "block";
			break;
	}
}

/////////////////////////////////////////////////////////////

window.onload = function () {

	canvas = document.getElementById("snake");
	ctx = canvas.getContext("2d");

	// Screens
	screen_snake = document.getElementById("snake");
	screen_menu = document.getElementById("menu");
	screen_gameover = document.getElementById("gameover");
	screen_setting = document.getElementById("setting");
	screen_pause = document.getElementById("pause");

	// Buttons
	button_newgame_setting = document.getElementById("newgame_setting");
	button_newgame_menu = document.getElementById("newgame_menu");
	button_newgame_gameover = document.getElementById("newgame_gameover");
	button_setting_menu = document.getElementById("setting_menu");
	button_setting_gameover = document.getElementById("setting_gameover");
	button_mainMenu_setting = document.getElementById("mainMenu_setting");
	button_mainMenu_gameover = document.getElementById("mainMenu_gameover");
	button_resume_pause = document.getElementById("resume_pause");
	button_newgame_pause = document.getElementById("newgame_pause");
	button_setting_pause = document.getElementById("setting_pause");
	button_mainMenu_pause = document.getElementById("mainMenu_pause");



	// etc
	ele_score = document.getElementById("score_value");
	ele_high_score = document.getElementById("high_score_value")
	speed_setting = document.getElementsByName("speed");
	wall_setting = document.getElementsByName("wall");
	wasd_setting = document.getElementsByName("wasd");
	multicolour_setting = document.getElementsByName("multicolour");

	// --------------------

	button_newgame_menu.onclick = function () { newGame(); };
	button_newgame_gameover.onclick = function () { newGame(); };
	button_newgame_setting.onclick = function () { newGame(); };
	button_setting_menu.onclick = function () { showScreen(2); };
	button_setting_gameover.onclick = function () { showScreen(2); };
	button_mainMenu_setting.onclick = function () { showScreen(1); };
	button_mainMenu_gameover.onclick = function () { showScreen(1); };
	resume_pause.onclick = function () {
		paused = false;
		showScreen(0);
		mainLoop();
	};
	newgame_pause.onclick = function () { newGame(); };
	setting_pause.onclick = function () { showScreen(2); };
	mainMenu_pause.onclick = function () { showScreen(1); };

	if (localStorage.getItem("snake_speed") == null) {
		setSnakeSpeed(120);
	}else{
		snake_speed = localStorage.getItem("snake_speed");
		for (var i = 0; i < speed_setting.length; i++) {
			if (speed_setting[i].value == snake_speed) {
				speed_setting[i].setAttributeNode(GetCheckedAttr());
			}else{
				speed_setting[i].removeAttribute("checked")
			}
		}
	}
	if (localStorage.getItem("wall") == null) {
		setWall(1);
	}else{
		setWall((localStorage.getItem("wall")=="true")?1:0);
		if (!wall){
			for (var i = 0; i < wall_setting.length; i++) {
				if (wall_setting[i].value == 1) {
					wall_setting[i].removeAttribute("checked")
				}else{
					wall_setting[i].setAttributeNode(GetCheckedAttr());
				}
			}
		}
	}
	if (localStorage.getItem("usewasd") == null) {
		setWasd(1)
	}else{
		usewasd = localStorage.getItem("usewasd")=="true";
		if (!usewasd){
			for (var i = 0; i < wasd_setting.length; i++) {
				if (wasd_setting[i].value == 0) {
					wasd_setting[i].setAttributeNode(GetCheckedAttr());
				}else{
					wasd_setting[i].removeAttribute("checked")
				}
			}
		}
	}
	if (localStorage.getItem("snake_multicolour") == null) {
		setmulticolour(1)
	}else{
		snake_multicolour = localStorage.getItem("snake_multicolour")=="true";
		if (snake_multicolour){
			for (var i = 0; i < multicolour_setting.length; i++) {
				if (multicolour_setting[i].value == 0) {
					multicolour_setting[i].setAttributeNode(GetCheckedAttr());
				}else{
					multicolour_setting[i].removeAttribute("checked")
				}
			}
		}
	}
	if (localStorage.getItem("score") != null) {
		score.load(localStorage.getItem("score"));
		score.score=0;
	}

	showScreen(1);

	// --------------------
	// Settings

	// speed
	for (var i = 0; i < speed_setting.length; i++) {
		speed_setting[i].addEventListener("click", function () {
			for (var i = 0; i < speed_setting.length; i++) {
				if (speed_setting[i].checked) {
					setSnakeSpeed(speed_setting[i].value);
				}
			}
		});
	}

	// wall
	for (var i = 0; i < wall_setting.length; i++) {
		wall_setting[i].addEventListener("click", function () {
			for (var i = 0; i < wall_setting.length; i++) {
				if (wall_setting[i].checked) {
					setWall(wall_setting[i].value);
				}
			}
		});
	}

	// wasd
	for (var i = 0; i < wasd_setting.length; i++) {
		wasd_setting[i].addEventListener("click", function () {
			for (var i = 0; i < wasd_setting.length; i++) {
				if (wasd_setting[i].checked) {
					setWasd(wasd_setting[i].value);
				}
			}
		});
	}

	// multicolour
	for (var i = 0; i < multicolour_setting.length; i++) {
		multicolour_setting[i].addEventListener("click", function () {
			for (var i = 0; i < multicolour_setting.length; i++) {
				if (multicolour_setting[i].checked) {
					setmulticolour(multicolour_setting[i].value);
				}
			}
		});
	}


	document.onkeydown = function (evt) {
		evt = evt || window.event;
		if ((CurrentScreen == Screens.game || CurrentScreen == Screens.pause || CurrentScreen == Screens.gameOver) && evt.key == "r") {
			newGame();
		}
		else if (evt.key == "p" && (CurrentScreen == Screens.pause || CurrentScreen == Screens.game)){
			if (paused){
				paused = false;
				showScreen(0);
				mainLoop();
			}else{
				paused = true;
			}
		}
	}
}