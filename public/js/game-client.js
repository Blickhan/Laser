/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	remotePlayers,	// Remote players
	socket, 		// Socket connection
	now,
	dt,
	lastFrameTimeMs,
	maxFPS,
	timestep,
	fps,
	framesThisSecond,
	lastFpsUpdate,
	updateScoreTick = 0,
	lasers;
	


/**************************************************
** GAME INITIALISATION
**************************************************/
function init(name) {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	
	// for calculating delta time
	now = Date.now();
	
	dt = 0;
	lastFrameTimeMs = 0;
	maxFPS = 60;
	timestep = 1000/60;
	fps = 60;
	framesThisSecond = 0;
	lastFpsUpdate = 0;

	// Maximise the canvas
	canvas.width = document.getElementById("gameCanvas").clientWidth;//Math.round(window.innerWidth * .8);
	canvas.height = document.getElementById("gameCanvas").clientHeight;//window.innerHeight;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-30)),
		startY = Math.round(Math.random()*(canvas.height-30));

	// a few pleasant colors to choose from
	var colors = ['#3ae1aa','#00ffff','#6600ff','#ffff00','#ff24ca','#ff4500','#d20080','#108845','#0033ff']
	//var newcolor = '#'+Math.floor(Math.random()*16777215).toString(16);
	var newcolor = colors[Math.floor(Math.random()*colors.length)];	
		
	if(name == "Jason"){newcolor = '#6600ff';}
	else if(validTextColor(name)){newcolor = name;}
		
	// Initialise the local player
	localPlayer = new Player(startX, startY, name, newcolor);

	
	// Initialise socket connection
	
	socket = io();//"http://localhost";

	// Initialise remote players array
	remotePlayers = [];
	
	lasers = [];

	// Start listening for events
	setEventHandlers();
	
	onReady();

};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);
	window.addEventListener("deviceorientation",onDeviceOrientation,false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);
	
	socket.on("update lasers", function(data) {
		lasers = [];
		for(var i = 0; i <data.length; i++){
			var newLaser = new Laser(data[i].x,data[i].y,data[i].color,data[i].direction,data[i].type);
			lasers.push(newLaser);
		}
	});
	
	socket.on('messages-available', function (data) {
		for (var i = 0; i < data.length; i++) {
			addMessage(data[i]);
		}
		
	});
	
	socket.on('message-added', addMessage);
	
	// get scores for each player
	//socket.on("scores-available", displayScore);
	
	socket.on('scores-available', function (data) {
		
		$('#scores').html('<div id="eachscore" style="color:white;">Scores <span class="glyphicon glyphicon-list"></span></div>');
		for (var i = 0; i < data.s.length; i++) {
			displayScore(i+1,data.s[i]);
		}
		$('#topscores').html('<div id="eachscore" style="color:white;"><span class="glyphicon glyphicon-bishop"></span> High Scores</div>');
		for (var i = 0; i < data.all.length; i++) {
			displayTopScore(i+1,data.all[i]);
		}
		
	});
	
};

function displayScore (rank,data) {
    $('#scores').append("<div id='eachscore'><font style='color:white;font-weight:bold;'>" +
		rank+"	</font>" +
		"<font style='color:" +
		data.color+";'>" +
        data.name + ": " +
        data.score + "</font><br></div>");
	
	
};

function displayTopScore (rank,data) {
    $('#topscores').append("<div id='eachscore'><font style='color:white;font-weight:bold;'>" +
		rank+"	</font>" +
		"<font style='color:" +
		data.color+";'>" +
        data.name + ": " +
        data.score + "</font><br></div>");
	
	
};

function addMessage (data) {
    $('#messages').append("<div id='eachmessage'><font style='color:" +
		data.color+";font-weight:bold;'>" +
        data.name + "</font>: " +
        escapeHtml(data.message) + "<br></div>");
	
	$('#messages').stop().animate({
			scrollTop: $("#messages")[0].scrollHeight
	}, 800);
};

function sendMessage(){
    
    // Send the "add-message" message to the server with our values
    socket.emit('add-message', {
        name: localPlayer.getName(),
		color: localPlayer.getColor(),
        message: $('textarea[name="message"]').val()
    });

    // Clear out the message value
    $('textarea[name="message"]').val('');

};

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Keyboard key down
function onDeviceOrientation(event) {
	if (localPlayer) {
		keys.onDeviceOrientation(event);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = document.getElementById("gameCanvas").clientWidth;;
	canvas.height = document.getElementById("gameCanvas").clientHeight;;
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), name: localPlayer.getName(), color: localPlayer.getColor()});
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected\nID:"+data.id+"\nName:"+data.name);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y, data.name, data.color);
	newPlayer.id = data.id;

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setSize(data.size);
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found\nID:"+data.id+"\nName:"+data.name);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};


/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	timestamp = Date.now()

    // Throttle the frame rate.    
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        requestAnimationFrame(animate);
        return;
    }
    dt += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

	// get fps
    if (timestamp > lastFpsUpdate + 1000) {
        fps = 0.25 * framesThisSecond + 0.75 * fps;

        lastFpsUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;

	// update game state
    var numUpdateSteps = 0;
    while (dt >= timestep) {
        update(timestep);
        dt -= timestep;
        if (++numUpdateSteps >= 240) {
            dt = 0;
            break;
        }
    }
    draw();

    requestAnimationFrame(animate);
	
};


/**************************************************
** GAME UPDATE
**************************************************/
function update(dt) {
	
	updateScore(dt);

	
	for(var i = 0; i < lasers.length; i++){
		lasers[i].update(dt, localPlayer);
	}
	
	// Update local player and check for change
	//if (localPlayer.update(dt, keys, remotePlayers)) {
	localPlayer.update(dt, keys, remotePlayers);
		// Send local player data to the game server
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(), size: localPlayer.getSize()});
	//};
};

function updateScore(dt) {
	//score = Math.round(Date.now() - creationTime);
	//localPlayer.setScore(Math.round(Date.now() - localPlayer.getCreationTime())/1000);
	localPlayer.setScore(localPlayer.getScore() + dt/1000);
	
	// update score on server 
	updateScoreTick++;
	if(updateScoreTick > 10){
		socket.emit("update score", {score: localPlayer.getScore()});
		updateScoreTick = 0;
	}
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	$('#debug').html('FPS: ' + Math.round(fps) + '<br>(' + 
	Math.round(localPlayer.getX()) + ', ' + Math.round(localPlayer.getY()) + ')');
	
	$('#score').html('Score: ' + localPlayer.getScore().toFixed(1));
	
	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
	};
	for(i = 0; i < lasers.length; i++){
		lasers[i].draw(ctx);
	}
	
	// keep local player in focus on screen
	
	var newx = -localPlayer.getSize()/2 - localPlayer.getX() + $(window).width() * .4; // .4 (40%) is half of the game screen (80%) (chat takes up 20%)
	var newy = -localPlayer.getSize()/2 - localPlayer.getY() + $(window).height() * .5; // .5 (50%) is half
	
	if(newx > 0){newx = 0;}
	if(newy > 0){newy = 0;}
	if(newx  < -canvas.width + $(window).width()*.8){newx = -canvas.width + $(window).width()*.8;}
	if(newy  < -canvas.height + $(window).height()){newy = -canvas.height + $(window).height();}
	//if(newy > canvas.height){newy = canvas.height;}
	
	$('#canvasdiv').css({top: newy, left: newx});
	
	// Draw the local player
	localPlayer.draw(ctx);
	
	
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};

//this works in preventing <script> in sendMessage()
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

// UNSAFE with unsafe strings; only use on previously-escaped ones!
function unescapeHtml(escapedStr) {
    var div = document.createElement('div');
    div.innerHTML = escapedStr;
    var child = div.childNodes[0];
    return child ? child.nodeValue : '';
};

function validTextColor(stringToTest) {
    //Alter the following conditions according to your need.
    if (stringToTest === "") { return false; }
    if (stringToTest === "inherit") { return false; }
    if (stringToTest === "transparent") { return false; }
    
    var image = document.createElement("img");
    image.style.color = "rgb(0, 0, 0)";
    image.style.color = stringToTest;
    if (image.style.color !== "rgb(0, 0, 0)") { return true; }
    image.style.color = "rgb(255, 255, 255)";
    image.style.color = stringToTest;
    return image.style.color !== "rgb(255, 255, 255)";
}

function onReady(){
	$(document).ready(function(){
	
		$('#sendbutton').click(function() {
			sendMessage();
		});
	
		$(document).keydown(function(event) {
			if(lastEvent && lastEvent.keyCode == event.keyCode){
				return;
			}
			
			if (event.ctrlKey==true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109'  || event.which == '187'  || event.which == '189' ) ) {
			 //alert('disabling zooming'); 
			event.preventDefault();
			// 107 Num Key  +,109 Num Key  -,173 Min Key  hyphen/underscore, 61 Plus key  +/=
			 }
			 else if(event.which=='13'){
				sendMessage();
				$("textarea[name='message']").blur();
			 }
			 else{
				if(!$("textarea[name='message']").is(":focus")){
					$("textarea[name='message']").focus();
				}
			 }
			 lastEvent = event;
			 heldKeys[event.keyCode] = true;
		});

		$(window).bind('mousewheel DOMMouseScroll', function (event) {
			   if (event.ctrlKey == true) {
			   //alert('disabling zooming'); 
			   event.preventDefault();
			   }
		});
		
		$(document).keyup(function(event) {
			lastEvent = null;
			delete heldKeys[event.keyCode];
		});
		
	});
}