stage=null;
// SOME GLUE CODE CONNECTING THIS PAGE TO THE STAGE
interval=null; score = 0;
move = false;
mobInterval = null;



function login(){
	var user = $("#user").val();
	var match2 = /^[a-zA-Z0-9]+$/;
	var password = $("#password").val();

	function validateLogin() {
		if (!user.match(match2)) {
			$("#error").html("Error: User Name must be Alphanumeric");	
			//alert("username must be Alphanumeric");
		} else if (password.length < 8) {
			$("#error").html("Password must be atleast 8 characters long");	
		} else {
			var log = {"user": $("#user").val(), "password": $("#password").val()};
			
			$.ajax({ 																					
				method: "POST", 
				url: "/api/ww/login", // + "/" + $("#user").val() + "/" + $("#password").val(),
				data: log
				
			}).done(function(data){
				
				console.log("Got back: "+ data);
				if( data == 1 ){
				 	$("#error").html("Error: User not Registered, Please go back to register screen");
					if("error" in data){ 
						console.log(data["error"]);
					}
				} else {
					//if (data["user"].length !== 0) {
						window.user = $("#user").val();
						launchMenu();
					// } else {
					// 	console.log("user doesn't exists");
					// }
				}
				
			}).fail(function(err){
				console.log("login: you messed up");
				$("#error").html("Error: Wrong User Name or/and password");	
			});
		}

	}
	validateLogin();
}	

function registration() {
	//Registration form lets user know if issues
	//missing user duplication shows in terminal (where port is connected)
	var userSignup = $("#userSignup").val();
	var match = /^[a-zA-Z0-9]+$/;

	//for confirm password
	var userPassword = $("#userPassword").val(); 
	var userRPassword =  $("#userRPassword").val();  
	
	function validateConfirm(){ //JS validation
		
		if (!userSignup.match(match)) {
			alert("username must be Alphanumeric");

		} else if (userPassword.length < 8) {
			//userPassword.setCustomValidity("Password must be atleast 8 characters long"); doesn't work for length
			$("#error1").html("Error: Password must be atleast 8 characters long");

		} else if(userPassword != userRPassword) {
			$("#error1").html("Error: Passwords Don't Match");
			
		} else {
			
			var regis = {"user": $("#userSignup").val(), "password": $("#userPassword").val(), 
					"firstName": $("#firstName").val(), "lastName": $("#lastName").val(),
					"gender":$('input[name=gender]:checked').val(), "birthday":$("#bday").val()
				};
								
			$.ajax({ 
				method: "PUT", 
				url: "/api/ww/signup/",
				data: regis
				//contentType: "application/json; charset=utf-8",
				//dataType: "json"
				
			}).done(function(data){
				//console.log("Got back:"+JSON.stringify(data));
				console.log("Got back: "+ data);
				if( data == 0 ){
					$("#error1").html("Error: User Already Exists");
				 	console.log("Error: User Already Exists"); 
				} else {
					console.log("Registration done Succesfull");

					$("#main_menu").hide();
					$("#ui_login").show();
					$("#main_game").hide();
					$("#signup").hide();
					$("#profile").hide(); 
					
					$("#mainnav").hide();
					$("#gamenav").hide();
					$("#profilenav").hide();
					$("#logout").hide();

					//highScore();
				}
			}).fail(function(data) {
				console.log("wrong place to be in");
			});
		}
	}
	
	validateConfirm();
}

function updateProfile() {

	var changePassword = $("#changePassword").val(); 

	function validateProfile() {  //JS validation
		if (0 < changePassword.length && changePassword.length < 8 ) {
			$("#error2").html("Password must be 8 characters long");
		
		} else {
			var input = {user: window.user , firstName: $("#changeFirstName").val(), lastName:  $("#changeLastName").val(),
					password:  $("#changePassword").val()};
			
			$.ajax({ 
				method: "POST", 
				url: "/api/ww/profile/",
				data: input
				// contentType: "application/json; charset=utf-8",
				// dataType: "json"
			
			}).done(function(data){
				console.log("Got back:"+JSON.stringify(data));
				if("error" in data){ console.log(data["error"]); }
				else { 	

					$("#error2").html("Profile Successfully Updated");
					$("#main_menu").hide();
					$("#main_game").hide();
					$("#ui_login").hide();
					$("#signup").hide();
					$("#profile").show(); 

					$("#mainnav").show();
					$("#gamenav").show();
					$("#profilenav").show();
					$("#logout").show();}
			}).fail(function(err){ 
				console.log("you messed up in updateProfile");	
			});
		}
	}  
	validateProfile();

}

function deleteProfile() {

	
	// JS validation
	//var userDelete = document.getElementById("userDelete");

	var input = {user: window.user};
	console.log(input);

	if (confirm("Are you sure? Once is loose it's lost. This action can't be undone")) {
		
		$.ajax({
		method: "DELETE",
		url: "/api/ww/delete",
		data: input
		}).done(function(data){
			console.log("Got back:" + data);
			if("error" in data){ 
				$("#error3").html("Error: User Already Exists");
				console.log(data["Error: Deleting"]); 
			}
			else {
				
				window.user = "";
				pauseGame();
				resetGame();
				$(".input_text").val("");  //protecting old user infor
				$("#main_menu").hide();
				$("#ui_login").show();
				$("#main_game").hide();
				$("#signup").hide();
				$("#profile").hide();

				$("#mainnav").hide();
				$("#gamenav").hide();
				$("#profilenav").hide();
				$("#logout").hide();

				highScore();
				$("#error").html("Deleted Successfully");
				
			}
    				
		}).fail(function(data){
			console.log("you messed up in deletdProfile");
				
		});
	}
}

//shows high score in main screen
function highScore() {
	console.log("HIGH SCORES");
	$.ajax({ 
		method: "GET", 
		url: "/api/ww/user/"
		//data: JSON.stringify(input),
		//contentType: "application/json; charset=utf-8",
		//dataType: "json"
	
	}).done(function(data){
		console.log("PASSED");
		var s='<table><tr><th>User</th> <th>Score</th> <th>Rank</th></tr>';

		for (var j = 1; j<=10; j++) {
			s += "<tr>";

			if ( j <= data["user"].length) {
				s += "<td>" + data["user"][j-1]["user"]  +"</td>";
				s += "<td>" + data["user"][j-1]["score"] +"</td>";
			} else {
				s += "<td>&nbsp;</td>";
				s += "<td>&nbsp;</td>";
			}
			s += "<td>" + j +"</td>";
			s += "</tr>";
		}
		s+="</table>";
		document.getElementById("highScores").innerHTML =s;
		document.getElementById("menuHighScores").innerHTML =s;
		
	}).fail(function(err) {
		console.log("failed high score");
		console.log(err.status);
		console.log(JSON.stringify(err.responseJSON));	

	});
}

function getCurrentScore(){
	var cur_score = 99999;
	$.ajax({ 
		method: "GET", 
		url: "/api/ww/score/" + window.user + "/"
	}).done(function(data){
		console.log(data);
		console.log(data["score"]);
		cur_score = parseInt(data["score"]["score"]);
		
	}).fail(function(err) {
		console.log(err.status);
		console.log(JSON.stringify(err.responseJSON));

	});
	return cur_score;
}

function updateScore(end_score){
	$.ajax({ 
		method: "POST", 
		url: "/api/ww/score/" + window.user + "/" + end_score + "/"
	}).done(function(data){
		if("error" in data){ console.log(data["error"]); }
		
	}).fail(function(err){ 
		console.log("you messed up");
		$("#error").html("Please Provide the inputs");	
	});
}


function logout() { //basic done without score
	window.user = "";
	pauseGame();
	resetGame();
	$(".input_text").val("");  //protecting old user infor
	$("#main_menu").hide();
	$("#ui_login").show();
	$("#main_game").hide();
	$("#signup").hide();
	$("#profile").hide();

	$("#mainnav").hide();
	$("#gamenav").hide();
	$("#profilenav").hide();
	$("#logout").hide();

	highScore();
}


function signup() {
	$(".input_text").val("");
	$("#main_menu").hide();
	$("#ui_login").hide();
	$("#main_game").hide();
	$("#signup").show();
	$("#profile").hide();

	$("#mainnav").hide();
	$("#gamenav").hide();
	$("#profilenav").hide();
	$("#logout").hide();

}

function goback() {
	$(".input_text").val("");
	$("#main_menu").hide();
	$("#ui_login").show();
	$("#main_game").hide();
	$("#signup").hide();
	$("#profile").hide();

	$("#mainnav").hide();
	$("#gamenav").hide();
	$("#profilenav").hide();
	$("#logout").hide();

}

function launchMenu(){
	pauseGame();
	resetGame();
	$(".input_text").val("");
	$("#main_menu").show();
	$("#ui_login").hide();
	$("#main_game").hide();
	$("#signup").hide();
	$("#profile").hide();

	$("#mainnav").show();
	$("#gamenav").show();
	$("#profilenav").show();
	$("#logout").show();

	highScore();
}

function step(){
	score++;
	document.getElementById("GameScore").innerHTML="Score: " + score;
	stage.stepMonsters();
	if(stage.gameEnded){
		endGame(stage.gameWon, score);
	}
}

function setupGame(){
	stage=new Stage(20,20,"stage");  //given
	stage.initialize();
}

function startGame(){
	// YOUR CODE GOES HERE
	if (interval == null) {
		console.log("Setting interval");
		interval = setInterval(step, 1000);
	} else if(mobInterval == null) {    //added 
		mobInterval = setInterval(mob, 250);
	} else{
		console.log("interval not null");
	}
}

function pauseGame(){
	clearInterval(interval);
	interval = null;
}

	
function resetGame() {
	stage = null; 
	interval = null;
	mobInterval = null;

	clearInterval(interval);
	clearInterval(mobInterval);
	score = 0;
}

function playGame(){
	console.log("In Play Game");
	console.log("Setup game");
	setupGame();
	console.log("Done Setting up");
	console.log("Starting game");
	startGame();

	$("#main_menu").hide();
	$("#ui_login").hide();
	$("#main_game").show();
	$("#signup").hide();
	$("#profile").hide();

	$("#mainnav").show();
	$("#gamenav").show();
	$("#profilenav").show();
	$("#logout").show();
} 

function endGame(gameWon, end_score){
	pauseGame();
	resetGame();

	if(gameWon){
		alert("Game won with score: "+ end_score);
		var cur_score = getCurrentScore();
		if(end_score < cur_score){
			updateScore(end_score);
		}
	} else{
		alert("Game lost with score: "+ score);
	}

	$("#main_menu").show();
	$("#main_game").hide();
	$("#ui_login").hide();
	$("#signup").hide();
	$("#profile").hide();

	$("#mainnav").show();
	$("#gamenav").show();
	$("#profilenav").show();
	$("#logout").show(); 
	
	highScore();
}

function profileGame(){
	pauseGame();
	resetGame();
	$("#main_menu").hide();
	$("#ui_login").hide();
	$("#main_game").hide();
	$("#signup").hide();
	$("#profile").show();

	$("#mainnav").show();
	$("#gamenav").show();
	$("#profilenav").show();
	$("#logout").show();

	
	//$("#saveChanges").on('click',   function(){ updateProfile(); });  //profile
	//$("#deleteProfile").on('click', function() { deleteProfile(); })
}

function sendMove(num){
	if(stage != null){
		stage.movePlayer(num);
	}
}

document.onkeyup = function(e){
	if(stage != null){
		e = e || window.event;
		var charCode = e.keyCode || e.which;
		var charStr = String.fromCharCode(charCode);

		console.log("Key press detected: "+ charStr);
		switch(charStr){
			case "Q":
				stage.movePlayer(0);
				break;
			case "W":
				stage.movePlayer(1);
				break;
			case "E":
				stage.movePlayer(2);
				break;
			case "A":
				stage.movePlayer(3);
				break;
			case "D":
				stage.movePlayer(4);
				break;
			case "Z":
				stage.movePlayer(5);
				break;
			case "X":
				stage.movePlayer(6);
				break;
			case "C":
				stage.movePlayer(7);
				break;
			case "M":
				endGame(true, 100);
				break;
		}
	}
}

function mob(){
	move = true;
}

function mobileMove(event){

	var orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
	if(move){
	  	x  = event.beta;
	  	y  = event.gamma;

	  	if(orientation.type == "portrait-primary"){
		  	if(y >= 20){
				stage.movePlayer(4);   //East
		  	} else if (y <= -20){
				stage.movePlayer(3);  //West 
			} else if (x <= 15) {
				stage.movePlayer(1);  //North
		  	} else if (x >= 40) {
				stage.movePlayer(0);  //South
		  	} else {
		  		socket.send(JSON.stringify({'direction': "Do nothing"})); 
			  }
			  

		} else {     //landscape it switches x -- East and West         y- North and South
			if(x >= 10){
		  		socket.send(JSON.stringify({'direction': "E"})); 
		  	} if (x <= -10){
		  		socket.send(JSON.stringify({'direction': "W"})); 
		  	} if (y >= -10) {
		  		socket.send(JSON.stringify({'direction': "N"})); 
		  	} else if (y <= -40) {
		  		socket.send(JSON.stringify({'direction': "S"})); 
		  	} else {
		  		socket.send(JSON.stringify({'direction': "Do nothing"})); 
		  	}
		}
	  	move = false;
  	}
}



function connectSocket(){
	socket = new WebSocket("ws://cslinux.utm.utoronto.ca:10818");
	//socket = new WebSocket("ws://localhost:10818");
	socket.onopen = function (event) {
		console.log("connected");
	};
	socket.onclose = function (event) {
		//show score
		//reset game
		//alert("closed code:" + event.code + " reason:" +event.reason + " wasClean:"+event.wasClean);
		console.log("disconnected");
		
	};
	socket.onmessage = function (event) {
	
	}

	if(window.DeviceOrientationEvent){
		window.addEventListener('deviceorientation', mobileMove);
	}

}
function closeSocket(){
	socket.close();
}

// This is executed when the document is ready (the DOM for this document is loaded)
$(function(){
	$("form").submit(false);

	// Setup all events here and display the appropriate UI

	//nav
	$("#mainnav").on('click', launchMenu);
	$("#gamenav").on('click', playGame);
	$("#profilenav").on('click', profileGame);
	$("#logout").on('click', logout);

	//main menu

	// Game buttons
	$("#north_west_btn").on('click', function(){stage.movePlayer(0);});
	$("#north_btn").on('click', function(){stage.movePlayer(1);});
	$("#north_east_btn").on('click', function(){stage.movePlayer(2);});
	$("#west_btn").on('click', function(){stage.movePlayer(3);});
	$("#east_btn").on('click', function(){stage.movePlayer(4);});
	$("#south_west_btn").on('click', function(){stage.movePlayer(5);});
	$("#south_btn").on('click', function(){stage.movePlayer(6);});
	$("#south_east_btn").on('click', function(){stage.movePlayer(7);});
	
	
	$("#main_menu").hide();
	$("#ui_login").show();
	$("#main_game").hide();
	$("#signup").hide();
	$("#profile").hide();

	$("#mainnav").hide();
	$("#gamenav").hide();
	$("#profilenav").hide();
	$("#logout").hide();
	
	highScore();
	//$('#highScores').html(score);
	
	
});
