/**************************************************
** LASER CLASS
**************************************************/
var Laser = function(startX, startY, color,startDirection) {
	var x = startX,
		y = startY,
		lasercolor = color,
		id,
		direction = startDirection;

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
	
	var getColor = function() {
		return lasercolor;
	};
	
	var setColor = function(color) {
		lasercolor = color;
	};
	
	var getDirection = function() {
		return direction;
	};

	var setDirection = function(newDirection) {
		direction = newDirection;
	};


	// Define which variables and methods can be accessed
	return {
		setColor: setColor,
		getColor: getColor,
		setDirection: setDirection,
		getDirection: getDirection,
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		id: id
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Laser = Laser;