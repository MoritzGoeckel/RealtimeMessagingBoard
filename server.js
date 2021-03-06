let Socket = require('socket.io');
let Express = require('express')

let httpPort = 3000;
let socketPort = 3001;

var server = Socket(socketPort);

var express = Express();
express.use(Express.static(__dirname + '/frontend'));
express.listen(httpPort, function () {
  console.log('http on port ' + httpPort);
});

nextUserId = 0;
nextRoomId = 2;
nextMessageId = 0;

let rooms = {
	"Info":{
		"users":[],
		"msgs":[]
	},
	"Spam":{
		"users":[],
		"msgs":[]
	} };

let users = {};

//Supporting Functions
//Notifing all the user in a room
function notifyInRoom(room, message){
	let usersToNotify = rooms[room].users;
	for(let i in usersToNotify)
	{
		users[usersToNotify[i]].socket.emit("print", message);
	}
}

//Checking a user out of her room
function checkoutUser(userid){
	if(users[userid].room != undefined)
	{
		notifyInRoom(users[userid].room, users[userid].name + " left the room");	

		let index = -1;
		for(let i = 0; i < rooms[users[userid].room].users.length; i++)
			if(rooms[users[userid].room].users[i] == userid)
			{
				index = i;
				break;
			}

		rooms[users[userid].room].users.splice(index, 1);
		users[userid].room = undefined;	
		delete users[userid].room;
	}
}

//Defining the possible commands
let commands = [];

//Help
commands.push(
	{
		disc:"/help", 
		regex:/^\/help$/, 
		fn:function(args, userid, socket)
		{
			socket.emit("print", "#############################");
			for(let i in commands)
				socket.emit("print", commands[i].disc);
			socket.emit("print", "#############################");				
		}
	}
);

//name
commands.push(
	{
		disc:"/name [user name]", 
		regex:/^\/name ([a-zA-Z0-9]+)$/, 
		fn:function(args, userid, socket)
		{
			let newName = args[1];
			
			let found = false;
			for(let i in users)
			{
				if(users[i].name == newName)
				{
					found = true;
					break;
				}
			}

			if(found == false)
			{
				if(users[userid].roomName != undefined)
					notifyInRoom(users[userid].roomName, users[userid].name + " renamed in " + newName);
				else
					socket.emit("print", "Renamed to " + newName);

				users[userid].name = newName;
			}
			else
			{
				socket.emit("print", "Error: name already taken");
			}				
		}
	}
);
	
//name
commands.push(
	{
		disc:"/name", 
		regex:/^\/name$/, 
		fn:function(args, userid, socket)
		{
			socket.emit("print", "Your name is " + users[userid].name);
		}
	}
);

//Join
commands.push(
	{
		disc:"/join [room name]", 
		regex:/^\/join ([a-zA-Z0-9]+)$/, 
		fn:function(args, userid, socket)
		{
			let roomName = args[1];
			
			//Create room
			if(rooms[roomName] == undefined)
				rooms[roomName] = {users:[], msgs:[]};

			//Checkout user
			checkoutUser(userid);

			//Checkin user
			users[userid].room = roomName;
			rooms[roomName].users.push(userid);
			notifyInRoom(roomName, users[userid].name + " joined the room");	
		}
	}
);

//Leave
commands.push(
	{
		disc:"/leave",
		regex:/^\/leave$/, 
		fn:function(args, userid, socket)
		{
			checkoutUser(userid);
		}
	}
);

//People
commands.push(
	{
		disc:"/people", 
		regex:/^\/people$/, 
		fn:function(args, userid, socket)
		{
			if(users[userid].room != undefined)
			{
				let output = "Users in room:";
				let usersInRoom = rooms[users[userid].room].users;
				for(let i in usersInRoom)
				{
					output += " " + users[usersInRoom[i]].name;
				}

				output += " (" + usersInRoom.length + ")";
				socket.emit("print", output);
			}
			else
			{
				socket.emit("print", "Error: Cant see people here");
			}
		}
	}
);

//Rooms
commands.push(
	{
		disc:"/rooms", 
		regex:/^\/rooms$/, 
		fn:function(args, userid, socket)
		{
			for(let r in rooms)
			{
				let extra = "";
				if(rooms[r].users.length > 0)
					extra = " (" + rooms[r].users.length + " active)";
				socket.emit("print", r + extra);
			}
		}
	}
);

//Message
commands.push(
	{
		disc:"[message]", 
		regex:/^([^\/]+)$/, 
		fn:function(args, userid, socket)
		{
			if(users[userid].room != undefined)
			{
				notifyInRoom(users[userid].room, users[userid].name + ": " + args[1]);
			}
			else
			{
				socket.emit("print", "Error: Cant send a message here");
			}
		}
	}
);

//Handle server connections
server.on('connection', function(socket){

	//Init user
	let id = nextUserId++;
	users[id] = {id:id, name:"anon_" + id, socket:socket, room:undefined};

	//Send the welcome message
	socket.emit("print", "Welcome!");
	socket.emit("print", "use /help");

	//Ask what the client wants to do
	let askLoop = function(){
		socket.emit("ask", "", function(line){
			let done = false;
			for(let i in commands)
			{
				if(commands[i].regex.test(line))
				{
					commands[i].fn(line.match(commands[i].regex), id, socket);
					done = true;
					break;
				}
			}

			if(done == false)
				socket.emit("print", "Error: Command not found");

			askLoop();
		});
	};

	askLoop();

	//On disconnect -> Remove user
	socket.on('disconnect', function(){
		checkoutUser(id);
		delete users[id];
	});
});