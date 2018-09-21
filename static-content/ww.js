// Stage
// Note: Yet another way to declare a class, using .prototype.

var directions = [[-1,-1], [0,-1], [1,-1],
				 [-1,0], [1,0],
				 [-1,1], [0,1], [1,1]];

function BlankSpace(x, y, model) {
	this.x = x;
	this.y = y;
	this.model = model;
	this.actorType = 0;
}

function Player(x, y, model) {
	this.x = x;
	this.y = y;
	this.model = model;
	this.actorType = 1;
}

function Wall(x, y, model) {
	this.x = x;
	this.y = y;
	this.model = model; 
	this.actorType = 4;
}

function Box(x, y, model) {
	this.x = x;
	this.y = y;
	this.model = model; 
	this.actorType = 2;
}

Box.prototype.move = function() {

}

function Monster(x, y, model) {
	this.x = x;
	this.y = y;
	this.model = model;
	this.actorType = 3; 
}

Monster.prototype.getAvailableMoves = function(){
	var availableMoves = []
	for(var i = 0; i < directions.length; i++){
		var newX = this.x + directions[i][1];
		var newY = this.y + directions[i][0];

		// Add if space is blank or player
		if(this.model[newX][newY].actorType == 0 || this.model[newX][newY].actorType == 1){
			availableMoves.push([newX,newY]);
		}
	}
	return availableMoves;
}

function Monster(x, y, model) {
	this.x = x;
	this.y = y;
	this.model = model;
	this.actorType = 3; 
}

Monster.prototype.getAvailableMoves = function(){
	var availableMoves = []
	for(var i = 0; i < directions.length; i++){
		var newX = this.x + directions[i][1];
		var newY = this.y + directions[i][0];

		// Add if space is blank or player
		if(this.model[newX][newY].actorType == 0 || this.model[newX][newY].actorType == 1){
			availableMoves.push([newX,newY]);
		}
	}
	return availableMoves;
}

function SmarterMonster(x, y, model) {
	this.x = x;
	this.y = y;
	this.model = model;
	this.actorType = 3; 
}

SmarterMonster.prototype.getAvailableMoves = function(){
	var availableMoves = []
	for(var i = 0; i < directions.length; i++){
		var newX = this.x + directions[i][1];
		var newY = this.y + directions[i][0];

		if(this.model[newX][newY].actorType == 1){
			return [[newX,newY]];
		}

		// Add if space is blank or player
		if(this.model[newX][newY].actorType == 0){
			availableMoves.push([newX,newY]);
		}
	}
	return availableMoves;
}

function Stage(width, height, stageElementID){
	this.monsters = [];
	this.numEnemies = 0;
	this.player=null; // a special actor, the player
	this.score = 0;

	// the logical width and height of the stage
	this.width=width;
	this.height=height;

	// Set gameWon and gameLost to false
	this.gameWon = false;
	this.gameLost = false;
	this.gameEnded = false;

	// the stage model
	this.model = null;

	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;

	// take a look at the value of these to understand why we capture them this way
	// an alternative would be to use 'new Image()'
	this.blankImageSrc=document.getElementById('blankImage').src;
	this.monsterImageSrc=document.getElementById('monsterImage').src;
	this.playerImageSrc=document.getElementById('playerImage').src;
	this.boxImageSrc=document.getElementById('boxImage').src;
	this.wallImageSrc=document.getElementById('wallImage').src;
}

// initialize an instance of the game
Stage.prototype.initialize=function(){ 
	console.log("Creating model");
	this.model = [];
	for (var column = 0; column < this.width; column++) {
		var newColumn = [];
		for(var row = 0; row < this.height; row++){
			newColumn.push(new BlankSpace(column, row, this.model));
		}
		this.model.push(newColumn);
	}

	console.log("Creating walls");
	// Add walls around the outside of the stage, so actors can't leave the stage
	for(var column = 0; column < this.width; column++){
		if(column == 0 || column == this.width - 1){
			for(var row = 0; row < this.height; row++){
				this.model[column][row] = new Wall(column, row, this.model);
			}
		} else{
			this.model[column][0] = new Wall(column, 0, this);
			this.model[column][this.height - 1] = new Wall(column,this.height - 1, this.model);
		}
	}

	console.log("Creating Player");
	// Add the player to the center of the stage
	var playerX = parseInt(this.width/2);
	var playerY = parseInt(this.height/2);
	this.player = new Player(playerX, playerY, this.model);
	this.model[playerX][playerY] = this.player;

	console.log("Creating Boxes");
	// Add some Boxes to the stage
	var numBoxesPerColumn = parseInt((this.height - 2)/4);
	for(var column = 1; column < this.width - 1; column++){
		var boxesLeft = numBoxesPerColumn;
		while (boxesLeft > 0){
			var randomRow = Math.floor((Math.random() * (this.height - 2)) + 1);
			if(this.model[column][randomRow].actorType == 0){
				var newBox = new Box(column, randomRow, this.model);
				this.model[column][randomRow] = newBox;
				boxesLeft--;
			}
		}
	}

	console.log("Creating Monsters");
	// Add in some Monsters
	this.numEnemies = parseInt(Math.sqrt((this.height - 2) * (this.width - 2)/2));
	var numEnemiesLeft = this.numEnemies;
	while (numEnemiesLeft > 0){
		var randomColumn = Math.floor((Math.random() * (this.width - 2)) + 1);
		var randomRow = Math.floor((Math.random() * (this.height - 2)) + 1);
		if(this.model[randomColumn][randomRow].actorType == 0){
			var newMonster = new Monster(randomColumn, randomRow, this.model);
			this.model[randomColumn][randomRow] = newMonster;
			this.addMonster(newMonster);
			numEnemiesLeft--;
		}
	}

	console.log("Creating SmarterMonsters");
	// Add in some Monsters
	this.numEnemies += 1;
	var numEnemiesLeft = 1;
	while (numEnemiesLeft > 0){
		var randomColumn = Math.floor((Math.random() * (this.width - 2)) + 1);
		var randomRow = Math.floor((Math.random() * (this.height - 2)) + 1);
		if(this.model[randomColumn][randomRow].actorType == 0){
			var newMonster = new SmarterMonster(randomColumn, randomRow, this.model);
			this.model[randomColumn][randomRow] = newMonster;
			this.addMonster(newMonster);
			numEnemiesLeft--;
		}
	}

	console.log("Creating Table");
	// Create a table of blank images, give each image an ID so we can reference it later
	var s='<table>';

	for (var ind=0; ind <this.height; ind++ ) {
		s += "<tr>";
		for (var index=0; index< this.width; index++ ) {
			s=s+'<td><img src="'+this.getIconSrc(this.model[ind][index])+'" id="'+this.getStageId(ind,index)+'" height="35" width="35" /></td>';
		}
		s += "</tr>";
	}
	s+="</table>";
	// Put it in the stageElementID (innerHTML)
	document.getElementById(this.stageElementID).innerHTML =s;

	console.log("Done Initialization");
}

Stage.prototype.getIconSrc=function(actor){
	var actorType = actor.actorType;
	if(actorType == 0){
		return this.blankImageSrc;
	} else if(actorType == 1){
		return this.playerImageSrc;
	} else if(actorType == 2){
		return this.boxImageSrc;
	} else if(actorType == 3){
		return this.monsterImageSrc;
	} else{
		return this.wallImageSrc;
	}
}

// Return the ID of a particular image, useful so we don't have to continually reconstruct IDs
Stage.prototype.getStageId=function(x,y){ return "Icon(x:"+ x +", y:"+ y +")"; }

Stage.prototype.addMonster=function(monster){
	this.monsters.push(monster);
}

Stage.prototype.removeMonster=function(monster){
	// Lookup javascript array manipulation (indexOf and splice).
	this.monsters.splice(this.monsters.indexOf(monster), 1);
	this.numEnemies--;
}

// Set the src of the image at stage location (x,y) to src
Stage.prototype.setImage=function(x, y, src){
	document.getElementById(this.getStageId(x,y)).src = src;
}

// Take one step for monsters in the animation of the game.  
Stage.prototype.stepMonsters=function(){
	//console.log("In stepMonsters. numEnemies: "+ this.numEnemies);
	if(this.monsters.length == 0){
		console.log("No more mosters");
		this.gameEnded = true;
		this.gameWon = true;
		return;
	}

	//console.log("Moving Monsters");
	for(var i=0; i < this.monsters.length; i++){
		// each monster takes a single step in the game
		var monster = this.monsters[i];
		
		//console.log("Getting available moves");
		var availableMoves = monster.getAvailableMoves();
		var len = availableMoves.length;

		if(len != 0){
			//console.log("We have available moves");
			var idx = Math.floor(Math.random() * len);
			var newCoord = availableMoves[idx];

			if(this.model[newCoord[0]][newCoord[1]].actorType == 1){
				this.gameLost = true;			
			}

			//console.log("Moving");
			this.move(monster, newCoord[0], newCoord[1], this.monsterImageSrc);
			//console.log("Done moving monster");
		} else{
			this.model[monster.x][monster.y] = new BlankSpace(monster.x, monster.y, this.model);
			this.setImage(monster.x, monster.y, this.blankImageSrc);
			this.removeMonster(monster);
		}
	}

	if(this.gameLost){
		this.gameEnded = true;
	}
	//console.log("Done moving monsters");
}

Stage.prototype.move = function(actor, newX, newY, imageSrc){
	// set new position to contain actor
	this.model[newX][newY] = actor;
	// set old position to contain blank space and update image
	this.model[actor.x][actor.y] = new BlankSpace(actor.x, actor.y, this.model);
	this.setImage(actor.x, actor.y, this.blankImageSrc);
	// change actor x and y and update image
	actor.x = newX;
	actor.y = newY;
	this.setImage(actor.x, actor.y, imageSrc);
}

Stage.prototype.pushActor = function(actor, directionNum){
	if(actor.actorType == 4 || actor.actorType == 3){
		// actor is wall or Monster. In which case we cannot push into
		return -1;
	} else if(actor.actorType == 0){
		// actor is blank. In which case we can push into
		return 0;
	} else{
		// actor is box. In which case we push the next actor
		var newX = actor.x + directions[directionNum][1];
		var newY = actor.y + directions[directionNum][0];

		// push next actor
		var result = this.pushActor(this.model[newX][newY], directionNum);
		if(result == 0){
			// simply move into blank spot
			this.move(actor, newX, newY, this.boxImageSrc);
			return 0;
		} else{
			// cannot push box
			return -1;
		}
	}
}


Stage.prototype.movePlayer = function(directionNum) {
	console.log("Moving Player");
	var newX = this.player.x + directions[directionNum][1];
	var newY = this.player.y + directions[directionNum][0];
	
	// Check if blank space or a box
	if(this.model[newX][newY].actorType == 0){
		this.move(this.player, newX, newY, this.playerImageSrc);
	} else if(this.model[newX][newY].actorType == 2){
		var result = this.pushActor(this.model[newX][newY], directionNum);
		if(result == 0){
			this.move(this.player, newX, newY, this.playerImageSrc);
		}
	}
}