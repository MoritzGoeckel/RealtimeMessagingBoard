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
	0:{
		"name": "Info",
		"users":[],
		"msgs":[]
	},
	1:{
		"name": "Spam",
		"users":[],
		"msgs":[]
	} };

let users = {};

server.on('connection', function(socket){

	let id = nextUserId++;
	users[id] = {id:id, name:"anon_" + id, socket:socket, room:-1};

	socket.on('set_name', function(msg){
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

			console.log(newMessage);

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

	socket.on('disconnect', function(){
		checkout();
		delete users[id];
		console.log(users);
	});
});