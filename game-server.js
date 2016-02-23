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
	Player = require("./Player").Player,	// Player class
	Laser = require("./Laser").Laser;	// Laser class
	
/**************************************************
** GAME VARIABLES
**************************************************/
var server,
	players,	// Array of connected players
	lasers,		// array of lasers
	topscore,
	numOfLasers = 0,
	scores,
	allTimeHighScores,
	allTimeBestPlayers;

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	
	app.use(express.static(__dirname + '/public'));
	
	//server.listen(8000);
	server.listen(80, "0.0.0.0");
	
	// Create an empty array to store players
	players = [];
	lasers = [];
	
	// create an empty array to store messages
	//messages = [];
	sockets = [];
	scores = [];
	allTimeHighScores = [];
	allTimeBestPlayers = [];

	topscore = 0;
	
	// Start listening for events
	setEventHandlers();
	
	setInterval(gameLoop,Math.floor((Math.random() * 2000) + 3000));
};

function gameLoop(){

	generateLasers();

	//util.log("numOfLasers: " + numOfLasers);
}

function generateLasers(){
	
	var i;
	numOfLasers = Math.floor(topscore/4) + 1;
	if(numOfLasers > 1000){numOfLasers = 1000;}
	lasers = [];
	
	for(i = 0; i < numOfLasers; i++){
		// create laser at random y value
		var laserDirection = Math.floor((Math.random()*4) + 1);
		var lx,	ly;
		
		if (laserDirection == 1){// from left
			lx = Math.floor((Math.random() * -300) + 1);
			ly = Math.floor((Math.random() * 2000) + 1);
		}else if (laserDirection == 2){// from top
			lx = Math.floor((Math.random() * 2000) + 1);
			ly = Math.floor((Math.random() * -300) + 1);
		}else if (laserDirection == 3){// from right
			lx = Math.floor((Math.random() * 300) + 2000);
			ly = Math.floor((Math.random() * 2000) + 1);
		}else if (laserDirection == 4){// from bottom
			lx = Math.floor((Math.random() * 2000) + 1);
			ly = Math.floor((Math.random() * 300) + 2000);
		}

		
		var newLaser = new Laser(lx, ly, '#ff0000', laserDirection);
		
		lasers.push({x: newLaser.getX(), y: newLaser.getY(), color: newLaser.getColor(), direction: newLaser.getDirection()});
	}

	// send laser info to each client
	sockets.forEach(function(client){
			client.emit('update lasers', lasers);
	});
	
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
	
	// Listen for score updates
	client.on("update score", onUpdateScore);
	
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

// update a players score and relay scores
function onUpdateScore(data) {
	// Find player in array
	var thisPlayer = playerById(this.id);

	// Player not found
	if (!thisPlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	//score cap
	if(data.score > 1337){data.score = 1337;}
	
	// Update player score
	thisPlayer.setScore(data.score);
	

	// Broadcast updated player scores
	var i;
	var topplayers = players;
	//allTimeHighScores = [];
	scores = [];
	
	// organize top player scores
	topplayers.sort(function(a,b){return b.getScore()-a.getScore();});
	var topContenders = topplayers.slice(0,5);
	
	for(i =0; i< topContenders.length; i++){
		var match = false;
		for(j =0; j< allTimeBestPlayers.length; j++){
			if(topContenders[i].id == allTimeBestPlayers[j].id){
				match = true;
			}
		}
		if(!match){
			allTimeBestPlayers.push(topContenders[i]);
		}
		
	}
	
	allTimeBestPlayers.sort(function(a,b){return b.getScore()-a.getScore();});
	allTimeBestPlayers = allTimeBestPlayers.slice(0,5);
	
	topscore = topplayers[0].getScore();
	
	for(i =0; i< allTimeBestPlayers.length; i++){
	var match = false;
	var switchScores = false;
		for(j =0; j< allTimeHighScores.length; j++){
			if(allTimeBestPlayers[i].id == allTimeHighScores[j].id){
				match = true;
				if(allTimeBestPlayers[i].getScore() > allTimeHighScores[j].score){
					switchScores = true;
					break;
				}
			}
		}
		if(match == true){
			if(switchScores == true){
				allTimeHighScores.splice(j,1,{id: allTimeBestPlayers[i].id, name: allTimeBestPlayers[i].getName(), color: allTimeBestPlayers[i].getColor(), score: allTimeBestPlayers[i].getScore().toFixed(1)});
			}
		}
		else{
			allTimeHighScores.push({id: allTimeBestPlayers[i].id, name: allTimeBestPlayers[i].getName(), color: allTimeBestPlayers[i].getColor(), score: allTimeBestPlayers[i].getScore().toFixed(1)});
		}
		
	}
	
	allTimeHighScores.sort(function(a,b){return b.score-a.score;})
	allTimeHighScores = allTimeHighScores.slice(0,5);
	
	for(i =0; i< topplayers.length; i++){
		
		scores.push({name: topplayers[i].getName(), color: topplayers[i].getColor(), score: topplayers[i].getScore().toFixed(1)});
	}
	
	// relay scores to player
	this.emit('scores-available', {s: scores,all: allTimeHighScores});
	
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
	movePlayer.setSize(data.size);

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), size: movePlayer.getSize()});
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