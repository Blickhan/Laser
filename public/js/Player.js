/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, name, color) {
	var x = startX,
		y = startY,
		id,
		size = 50,
		speed = .5,
		playername = name,
		playercolor = color;
	
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
	
	var setColor = function(color) {
		playercolor = color;
	};
	
	var getColor = function() {
		return playercolor;
	};
	
	var setSize = function(newSize) {
		size = newSize;
	};
	
	var getSize = function() {
		return size;
	};

	// Update player position
	var update = function(dt, keys, remotePlayers) {
		// Previous position
		var prevX = x,
			prevY = y;

		// Up key takes priority over down
		if (keys.up) {
			y -= speed * dt;
		} else if (keys.down) {
			y += speed * dt;
		};

		// Left key takes priority over right
		if (keys.left) {
			x -= speed * dt;
		} else if (keys.right) {
			x += speed * dt;
		};

		var allowMove = true;
		
		// collision detection 
		var i;
		for (i = 0; i < remotePlayers.length; i++) {
			if(playersColliding(remotePlayers[i])){
				allowMove = false;
			}
			
		};

		if(!allowMove){
			x = prevX;
			y = prevY;
		}

		if(x < 0){x = 0;}
		if(x > document.getElementById("gameCanvas").clientWidth - size){x = document.getElementById("gameCanvas").clientWidth - size;}
		if(y < 0){y = 0;}
		if(y > document.getElementById("gameCanvas").clientHeight - size){y = document.getElementById("gameCanvas").clientHeight - size;}

		
		return (prevX != x || prevY != y) ? true : false;
	};
	
	function playersColliding(p2) {
		return !(x > p2.getX() + p2.getSize() || x + size < p2.getX() || y > p2.getY() + p2.getSize() || y + size < p2.getY());
	}

	// Draw player
	var draw = function(ctx) {
		
		ctx.fillStyle =  playercolor;
		ctx.fillRect(x, y, size, size);
		ctx.strokeRect(x, y, size, size);
		
		ctx.font = "20pt Impact, sans-serif";
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#FFF';
		ctx.textAlign = "center";
		ctx.fillText(playername, x + size/2, y + size/2 );
		ctx.strokeText(playername, x + size/2, y + size/2 );
		//ctx.scale(.5,.5);
	};

	// Define which variables and methods can be accessed
	return {
		setColor: setColor,
		getColor: getColor,
		getSize: getSize,
		setSize: setSize,
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getName: getName,
		setName: setName,
		update: update,
		draw: draw
	}
};