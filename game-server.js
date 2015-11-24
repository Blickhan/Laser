/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var express = require('express'),
	fs = require('fs'),
	app = express(),
	server = require('http').createServer(app),
	url = require('url'),
	util = require("util"),					// Utility resources (logging, object inspection, etc)
	socket = require("socket.io").listen(server),			// Socket.IO
	Player = require("./Player").Player;	// Player class
	
/**************************************************
** GAME VARIABLES
**************************************************/
var server,
	players;	// Array of connected players

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	
	app.use(express.static(__dirname + '/public'));
	
	//server.listen(8000);
	server.listen(80, "0.0.0.0");
	
	// Create an empty array to store players
	players = [];
	
	// create an empty array to store messages
	//messages = [];
	sockets = [];

	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	socket.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
	util.log("New player has connected: "+client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);

	// Listen for move player message
	client.on("move player", onMovePlayer);
	
	sockets.push(client);
	
	//client.emit('messages-available', messages);
	
	client.on('add-message', function(data){
		//messages.push(data);
		sockets.forEach(function(client){
			client.emit('message-added', data);
		});
	});	
	
};

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
	// Create a new player
	var newPlayer = new Player(data.x, data.y, data.name, data.color);
	newPlayer.id = this.id;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), name: newPlayer.getName(), color: newPlayer.getColor()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), name: existingPlayer.getName(), color: existingPlayer.getColor() });
	};
		
	// Add new player to the players array
	players.push(newPlayer);
};

// Player has moved
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id);

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};


/**************************************************
** RUN THE GAME
**************************************************/
init();