//require('./static-content/lib/constants.js'); // defines wwPort and wwWsPort 
// not wokring properly
var express = require('express');
var app = express();


// https://expressjs.com/en/starter/static-files.html
app.use(express.static('static-content')); 

// Web sockets to broadcast results
var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: 10819});

var messages = [];
wss.on('close', function() {
    console.log('disconnected');
});

wss.broadcast = function(message){
        for(let ws of this.clients){
                ws.send(message);
        }
}

wss.on('connection', function(ws) {
	var i;
	for(i=0;i<messages.length;i++){
		ws.send(messages[i]);
	}
	ws.on('message', function(message) {
		console.log(message);
		// ws.send(message); 
		wss.broadcast(message);
		messages.push(message);
	});
});


// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies



 
//MOONGO SETUP 
// will create the db if it does not exist
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://qamarars:26901@mcsdb.utm.utoronto.ca:27017/qamarars_309";

// function connect () {
// 	//var url = "mongodb://qamarars:26901@mcsdb.utm.utoronto.ca:27017/qamarars_309";
// 	MongoClient.connect(url, function(err, db) {    //don't need it
// 		if (err) {
// 			console.error(err);
// 		}
// 		console.log('Connected to the database.');
// 		db.createcollection('appuser', function(err, collection) {});
// 		appuser = db.collection('appuser');
// 		//db.close();
// 	}); // mongo closes
// }






// create a new username
app.put('/api/ww/signup/', function (req, res) {   //request and response 
	var user = req.body.user;
	var password = req.body.password;
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var gender = req.body.gender;
	var birthday = req.body.birthday;


	var match4 = /^[a-zA-Z0-9]+$/;   //JS VALIDATION
	if (!user.match(match4)) {
		console.log("username must be Alphanumeric");
		res.status(409);       //not sure 403
	} else if (password.length < 8) {
		console.log("Password must be atleast 8 characters long");
		res.status(409);
	}	
	else {
		MongoClient.connect(url, function(err, db) {    
			if (err) {
				console.error(err);
			}
			console.log('Connected to the database.');
			
			var dbo = db.db("qamarars_309");		//dbo.collection('appuser', function(err, collection) {});
			var appuser = dbo.collection('appuser');
			var response = {};

			appuser.find({"user": user}).count(function (error, count) {

				if (count != 0) {
					res.json(0);
					console.log("user already exists");
				} else {
					
					appuser.insertOne({"user": user, "password": password, "firstName": firstName , 
						"lastName": lastName, "gender": gender, "birthday": birthday, "score":999999}, function (err, result) {
						
						//db.close();
						if (err) {
							response["status"]= "User exists already!"; //err.message;
							res.status(403).json(response);
							console.log("not updated Rows");
							console.log(JSON.stringify(response));

						} else {
							response["status"]= "Registriation Successfull"; 
							res.status(200).json(response); 
							console.log("updated Rows");
							console.log(JSON.stringify(response));
							//wss.broadcast();
						}
					
					})

				}
			})

		}); // mongo closes

	}
});



//retrieve only usernmae and password   ---- used for log in 
app.post('/api/ww/login', function (req, res) {
	 //testing 
	var user = req.body.user;
	var password = req.body.password;
	
	console.log(user);
	console.log(password);

	var match2 = /^[a-zA-Z0-9]+$/;
	if (!user.match(match2)) {
		console.log("username must be Alphanumeric");
		res.status(404); 
	} else if (password.length < 8) {
		console.log("Password must be atleast 8 characters long");
		res.status(404); 
	} else {
		MongoClient.connect(url, function(err, db) {    
			if (err) {
				console.error(err);
			}

			console.log('Connected to the database.');
			var dbo = db.db("qamarars_309");		//dbo.collection('appuser', function(err, collection) {});
			var appuser = dbo.collection('appuser');
			var response = {};

			appuser.find({"user": user, "password": password}).count(function (error, count) {

				if (count != 0) {
					response["status"] =  "Success" ;
				    res.status(201);
				    res.json(response);
				    console.log(JSON.stringify(response));
				} else {
					response["status"] =  "No Success: user/password doesn't exist " ;
				 	res.status(401);
				 	res.json(response);
					console.log(JSON.stringify(response));
				}
			
			})
		
		});

	}
});

// get score of player
// app.get('/api/ww/score/:user/', function (req, res) {
// 	var user = req.params.user;

// 	console.log('user '+user);

// 	let sql = 'SELECT score FROM appuser WHERE user=?;';
// 	db.get(sql, [user], (err, rows) => {
// 		var result = {};
//   		if (err) {
//   			res.status(404); 
// 			result["error"] = err.message;
//   		} else {
// 			//console.log('rows '+rows);
// 			result["score"] = rows;
// 			res.status(200);
// 		}
// 		res.json(result);
// 	});
// });

// update the score
// app.post('/api/ww/score/:user/:score/', function (req, res) {
// 	var user = req.params.user;
// 	var score = req.params.score;

// 	console.log('user '+user);
// 	console.log('score '+score);

// 	let sql = 'UPDATE appuser SET score=? WHERE user=?;';
// 	db.run(sql, [score,user], function (err){
// 		var result = {};
//   		if (err) {
// 			res.status(404); 
//     			result["error"] = err.message;
//   		} else {
// 			if(this.changes!=1){
//     				result["error"] = "Not updated";
// 				res.status(404);
// 			} else {
// 				result[user] = "updated rows: "+this.changes;
// 				res.status(201);
// 			}
// 		}
// 		res.json(result);
// 	});
// });

// update the profile page
app.post('/api/ww/profile/', function (req, res) {
	var user = req.body.user;
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var password = req.body.password;


	 if(0 < password.length && password.length < 8 ) {
		console.log("Password must be atleast 8 characters long");
		res.status(409);
	} else {
		MongoClient.connect(url, function(err, db) {    
		if (err) {
			console.error(err);
		}
		console.log('Connected to the database.');
		var dbo = db.db("qamarars_309");		
		var appuser = dbo.collection('appuser');

		var response = {};
		appuser.update({"user": user}, {$set: {"password": password, "firstName": firstName, "lastName": lastName}}, 
			function (err, result) {

			if (err && !result) {
				response ["status"] = "Update doesn't work";
				response.status(401);
				res.json(response);
				console.log(JSON.stringify(response));
			} else {
				response ["status"] = "Account Updated ";
				 res.status(201);
				 res.json(response);
				 console.log(JSON.stringify(response));
			}


			

		});
	});

	}
	
});	
		

	

//generates the high score table 
app.get('/api/ww/user/', function (req, res) {
	console.log("not coming here ");
	MongoClient.connect(url, function(err, db) {    
		if (err) {
			console.error(err);
		}
		console.log('Connected to the database.');
		var dbo = db.db("qamarars_309");		
		var appuser = dbo.collection('appuser');

		var result = {};
		appuser.find().sort({score: -1}), function (err, result) {
			if (err) {
				result["error"] = err.message;
				res.status(404);
				console.log("NOT updated Tables");
			} else {
				res.status(200);
				console.log("updated tables");
			
			}
			res.json(result);
			}
		
	});
});

//delete the user Profile
app.delete('/api/ww/delete', function (req, res) {
	
	
	var user = req.body.user;
	console.log(user);  //testing

	MongoClient.connect(url, function(err, db) {    
		if (err) {
			console.error(err);
		}

		console.log('Connected to the database.');
		var dbo = db.db("qamarars_309");		//dbo.collection('appuser', function(err, collection) {});
		var appuser = dbo.collection('appuser');
		var response = {};
	
		appuser.remove({user: user}, function(err) {
			
	  		if (err) {
    			response["status"] = "Not deleted";
    			res.status(404);
    			res.json(response);
	  		} else {
	  			response["status"] = "deleted";
				res.status(200);
				res.json(response);
				console.log("Deleted");
			}
			
			
		});


	});

});


app.listen(10818, function () {
  	console.log('Example app listening on port '+10818);
});


// db.close();

