/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function(up, left, right, down) {
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false;
		
	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 37: // Left
				that.left = true;
				break;
			case 38: // Up
				that.up = true;
				break;
			case 39: // Right
				that.right = true; // Will take priority over the left key
				break;
			case 40: // Down
				that.down = true;
				break;
		};
	};
	
	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Left
				that.left = false;
				break;
			case 38: // Up
				that.up = false;
				break;
			case 39: // Right
				that.right = false;
				break;
			case 40: // Down
				that.down = false;
				break;
		};
	};
	
	
	var onDeviceOrientation = function(event){
		
		var that = this;
		
		//alpha = Math.round(event.alpha); // around z-axis (0 to 360) 
		var beta = Math.round(event.beta);  // around x-axis (-180 to 180) ie front to back motion
		var gamma = Math.round(event.gamma); // around y-axis (-90 to 90) ie left to right motion
		
		// because we don't want to have the device upside down
		if (beta >  90) { beta =  90;}
		if (beta < -90) { beta = -90;}
		
		if(beta > 30){
			that.down = true;	
		}else{ that.down = false;}
		
		if(beta < 0){
			that.up = true;	
		}else{ that.up = false;}
		
		if(gamma < -10){
			that.left = true;	
		}else{ that.left = false;}
		
		if(gamma > 10){
			that.right = true;	
		}else{ that.right = false;}
		
	};

	return {
		up: up,
		left: left,
		right: right,
		down: down,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp,
		onDeviceOrientation: onDeviceOrientation
	};
};
