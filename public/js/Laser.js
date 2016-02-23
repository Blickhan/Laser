/**************************************************
** LASER CLASS
**************************************************/
var Laser = function(startX, startY, color, startDirection) {
	var x = startX,
		y = startY,
		w,
		l,
		id,
		speed = 1,
		lasercolor = color,
		direction = startDirection;
	
	if(direction == 1 || direction == 3){
		w = 50;
		l=10;
	}else{
		w = 10;
		l = 50;
	}
	
	if(direction == 3 || direction == 4){
		speed = -1;
	}
	
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
	
	var getW = function() {
		return w;
	};

	var getL = function() {
		return l;
	};

	var setW = function(newWidth) {
		w = newWidth;
	};

	var setL = function(newLength) {
		l = newLength;
	};
	
	
	var setColor = function(color) {
		lasercolor = color;
	};
	
	var getColor = function() {
		return lasercolor;
	};
	
	var getDirection = function() {
		return direction;
	};

	var setDirection = function(newDirection) {
		direction = newDirection;
	};
	

	// Update laser position
	var update = function(dt, localPlayer) {
		
		// Previous position
		var prevX = x,
			prevY = y;

		// laser moves across screen
		if(direction == 1 || direction == 3){
			x += speed * dt;		
		}else{y += speed * dt;}
		
		//var i;
		//for (i = 0; i < localPlayer.length; i++) {
			if(playersColliding(localPlayer)){
				localPlayer.setAlive(false);		
			}
			
		//};
		
		return (prevX != x || prevY != y) ? true : false;
	};
	
	function playersColliding(p2) {
		return !(x > p2.getX() + p2.getSize() || x + w < p2.getX() || y > p2.getY() + p2.getSize() || y + l < p2.getY());
	}
	
	// Draw laser
	var draw = function(ctx) {
		
		ctx.fillStyle =  lasercolor;
		ctx.fillRect(x, y, w, l);
		ctx.strokeStyle =  '#000';
		ctx.strokeRect(x, y, w, l);
		
		/*
		ctx.font = "20pt Impact, sans-serif";
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#FFF';
		ctx.textAlign = "center";
		ctx.fillText(playername, x + size/2, y + size/2 );
		ctx.strokeText(playername, x + size/2, y + size/2 );
		*/
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
		getW: getW,
		getL: getL,
		setW: setW,
		setL: setL,
		update: update,
		draw: draw
	}
};