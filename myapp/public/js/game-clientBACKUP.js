/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	remotePlayers,	// Remote players
	socket, 		// Socket connection
	now;

	


/**************************************************
** GAME INITIALISATION
**************************************************/
function init(name) {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	
	// for calculating delta time
	now = +new Date;

	// Maximise the canvas
	canvas.width = document.getElementById("gameCanvas").clientWidth;//Math.round(window.innerWidth * .8);
	canvas.height = document.getElementById("gameCanvas").clientHeight;//window.innerHeight;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-5)),
		startY = Math.round(Math.random()*(canvas.height-5));

	var newcolor = '#'+Math.floor(Math.random()*16777215).toString(16);
		
	// Initialise the local player
	localPlayer = new Player(startX, startY, name, newcolor);

	// Initialise socket connection
	
	socket = io();//"http://localhost";

	// Initialise remote players array
	remotePlayers = [];

	// Start listening for events
	setEventHandlers();
	
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
	
	socket.on('messages-available', function (data) {
		for (var i = 0; i < data.length; i++) {
			addMessage(data[i]);
		}
		
	});
	
	socket.on('message-added', addMessage);
};

function addMessage (data) {
    $('#messages').append("<div id='eachmessage'><font style='color:" +
		data.color+";font-weight:bold;'>" +
        data.name + "</font>: " +
        data.message + "<br></div>");
	
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

	var dt = -now + (now= +new Date);//now - lastUpdate;
	
	update(dt);
	draw();
	
	
	// Request a new animation frame using Paul Irish's shim
	var newx = -localPlayer.getSize()/2 - localPlayer.getX() + $(window).width() * .4; // .4 (40%) is half of the game screen (80%) (chat takes up 20%)
	var newy = -localPlayer.getSize()/2 - localPlayer.getY() + $(window).height() * .5; // .5 (50%) is half
	//velocity.js causing dt to go to 0 when tab was changed so using animate instead
	$('#canvasdiv').animate({top: newy, left: newx},10,function(){
		animate();
	});
	
};


/**************************************************
** GAME UPDATE
**************************************************/
function update(dt) {
	
	$('#debug').text(Math.round(fps) + 'fps');
	
	// Update local player and check for change
	if (localPlayer.update(dt, keys, remotePlayers)) {
		// Send local player data to the game server
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
	};
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
	};
	
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