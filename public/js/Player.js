/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, name, color) {
	var x = startX,
		y = startY,
		id,
		defaultSize = 30,
		size = defaultSize,
		speed = .4,
		playername = name,
		playercolor = color,
		alive = true,
		score = 0,
		creationTime = Date.now();
	
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
	
	var getAlive = function() {
		return alive;
	};
	
	var setAlive = function(a) {
		alive = a;
	};
	
	var getScore = function() {
		return score;
	};
	
	var setScore = function(s) {
		score = s;
	};
	
	var getCreationTime = function() {
		return creationTime;
	};
	
	var setCreationTime = function(ct) {
		creationTime = ct;
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
				if(size > remotePlayers[i].getSize()){
					score = score + remotePlayers[i].getScore();
					remotePlayers[i].setAlive(false);
				}
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

		if(alive == false){
			respawn();
		}
		
		score = score + dt/1000;
		
		grow();
		
		return (prevX != x || prevY != y) ? true : false;
	};
	
	function playersColliding(p2) {
		return !(x > p2.getX() + p2.getSize() || x + size < p2.getX() || y > p2.getY() + p2.getSize() || y + size < p2.getY());
	}

	function respawn(){	
		x = Math.round(Math.random()*(document.getElementById("gameCanvas").clientWidth-size));
		y = Math.round(Math.random()*(document.getElementById("gameCanvas").clientHeight-size));
		size = defaultSize;
		score = 0;
		alive = true;
	};
	
	function grow(){
	
		size = size + score/4000;
	
	}
	
	// Draw player
	var draw = function(ctx) {
		var d = new Date();
		var n = d.getMilliseconds()/1000;
		if(n>.5){n = 1-n;}
		var pulse = (.75-Math.abs(n))*size; // custom wave
		//var pulse = (1-Math.abs(score%2 - 1))*size; //triangle wave
		if(pulse < size/3){pulse = size/3;}
		else if(pulse > size*2/3){pulse = size*2/3;}
		
		var grd=ctx.createRadialGradient(x+size/2,y+size/2,pulse,x+size*2/3,y+size*2/3,size);
		grd.addColorStop(0,playercolor);
		grd.addColorStop(1,"black");
		
		ctx.fillStyle =  grd;
		ctx.fillRect(x, y, size, size);
		ctx.strokeStyle =  '#000';
		ctx.strokeRect(x, y, size, size);
		
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
		setAlive: setAlive,
		getAlive: getAlive,
		setScore: setScore,
		getScore: getScore,
		setCreationTime: setCreationTime,
		getCreationTime: getCreationTime,
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
