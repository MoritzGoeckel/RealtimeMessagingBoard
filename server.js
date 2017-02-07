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

function notifyInRoom(room, message){
	let usersToNotify = rooms[room].users;
	for(let i in usersToNotify)
	{
		users[usersToNotify[i]].socket.emit("print", message);
	}
}

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

let commands = [{disc:"/help", regex:/^\/help$/, fn:
		function(args, userid, socket){
			socket.emit("print", "#############################");
			for(let i in commands)
				socket.emit("print", commands[i].disc);
			socket.emit("print", "#############################");				
		}
	},
	{disc:"/name [user name]", regex:/^\/name ([a-zA-Z0-9]+)$/, fn:
		function(args, userid, socket){
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
					socket.emit("print", "Renamed in " + newName);

				users[userid].name = newName;
			}
			else
			{
				socket.emit("print", "Error: name already taken");
			}				
		}
	},
	{disc:"/name", regex:/^\/name$/, fn:
		function(args, userid, socket){
			socket.emit("print", "Your name is " + users[userid].name);
		}
	},
	{disc:"/join [room name]", regex:/^\/join ([a-zA-Z0-9]+)$/, fn:
		function(args, userid, socket){
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
	},
	{disc:"/leave", regex:/^\/leave$/, fn:
		function(args, userid, socket){
			checkoutUser(userid);
		}
	},
	{disc:"/people", regex:/^\/people$/, fn:
		function(args, userid, socket){
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
	},
	{disc:"/rooms", regex:/^\/rooms$/, fn:
		function(args, userid, socket){
			for(let r in rooms)
			{
				let extra = "";
				if(rooms[r].users.length > 0)
					extra = " (" + rooms[r].users.length + " active)";
				socket.emit("print", r + extra);
			}
		}
	},
	{disc:"[message]", regex:/^([^\/]+)$/, fn:
		function(args, userid, socket){
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
];

server.on('connection', function(socket){

	let id = nextUserId++;
	users[id] = {id:id, name:"anon_" + id, socket:socket, room:undefined};

	socket.emit("print", "Welcome!");
	socket.emit("print", "use /help");

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

	/*for(let i in rooms)
		socket.emit("print", rooms[i].name);*/

	/*socket.on('set_name', function(msg){
		let found = false;
		for(let i in users)
		{
			if(users[i].name == msg.name)
			{
				found = true;
				break;
			}
		}

		if(found == false){
			users[id].name = msg.name;
			socket.emit('set_name', {id:id, name:users[id].name});
		}
	});

	socket.on('rooms', function(msg){
		let output = [];
		for(let i in rooms)
		{
			output.push({id:i, name:rooms[i].name, users:rooms[i].users.length});
		}

		socket.emit('rooms', output);
	});

	socket.on('message', function(msg){
		if(users[id].room == msg.room)
		{
			let newMessage = {msg:msg.msg, id:nextMessageId++, date:new Date().toISOString(), user:id, userName:users[id].name};
			rooms[msg.room].msgs.push(newMessage);

			for(let i in rooms[msg.room].users)
			{
				if(rooms[msg.room].users[i] != id)
					users[rooms[msg.room].users[i]].socket.emit('message', newMessage);
			}
		}
		else
		{
			console.log(users[id].room + "!=" + msg.room);
		}
	});

	let checkout = function(){
		if(users[id].room != -1)
		{
			let index = -1;
			for(let i = 0; i < rooms[users[id].room].users.length; i++)
				if(rooms[users[id].room].users[i] == id)
				{
					index = i;
					break;
				}

			rooms[users[id].room].users.splice(index, 1);
			users[id].room = -1;
		}
	};

	socket.on('join', function(msg){
		checkout();

		rooms[msg.room].users.push(id);
		users[id].room = msg.room;

		let msgs = rooms[msg.room].msgs;
		for(let i = msgs.length - 20; i < msgs.length; i++) //How many
		{
			if(i >= 0)
				socket.emit('message', msgs[i]);
		}
	});

	socket.on('leave', function(msg){
		checkout();
	});

	socket.on('create_room', function(msg){
		let found = false;
		for(let i in rooms)
		{
			if(rooms[i].name == msg.name)
			{
				found = true;
				break;
			}
		}

		if(found == false)
		{
			rooms[nextRoomId++] = {
				"name": msg.name,
				"users":[],
				"msgs":[]
			};
		}

		//Remove them sometimes?
	});*/

	socket.on('disconnect', function(){
		//checkout();
		delete users[id];
	});
});