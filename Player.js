/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, name, color) {
	var x = startX,
		y = startY,
		playername = name,
		playercolor = color,
		id;

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};
	
	var getName = function() {
		return playername;
	};

	var setName = function(name) {
		playername = name;
	};
	
	var getColor = function() {
		return playercolor;
	};
	
	var setColor = function(color) {
		playercolor = color;
	};

	// Define which variables and methods can be accessed
	return {
		setColor: setColor,
		getColor: getColor,
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getName: getName,
		setName: setName,
		id: id
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;