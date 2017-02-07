baseUrl = "http://moritzg.serpens.uberspace.de/n/";

let socket = io.connect('http:' + window.location.href.split(":")[1] + ':3001');
let rooms = undefined;

let enteredRoom = undefined;

socket.on('message', function(msg){
	console.log(msg);
	if(msg.room = enteredRoom.id)
		printLine(msg.userName + ": " + msg.msg, "green");
});

socket.on('set_name', function(msg){
	console.log(msg);
	printLine("Your name is " + msg.name, "green");
});

socket.on('rooms', function(msg){
	console.log(msg);
	rooms = msg;
});

printLine("### Welcome ###", "green");
readLine("Set username:", "white", function(line){

	socket.emit('set_name', {name:line});
	openRoomsMenu();
	
});

function askForRoom()
{
	readLine("Enter room:", "white", function(line){
		for(let i in rooms)
			if(rooms[i].id == line){
				enteredRoom = rooms[i];
				break;
			}

		if(enteredRoom == undefined)
		{
			printLine("Room does not exist", "red");
			askForRoom();
		}
		else
		{
			printLine("##################", 'green');
			printLine("Now in room: " + enteredRoom.name, "green");
			printLine("Type 'exit' to leave", "green");
			printLine("##################", 'green');
			
			socket.emit('join', {room:enteredRoom.id});
			
			let listener = addInputListener(function(line){
				if(line != "exit")
				{
					printLine("You: " + line, "green");
					socket.emit('message', {room:enteredRoom.id, msg:line});
				}
				else
				{
					rooms = undefined;
					removeInputListener(listener);					
					openRoomsMenu();
				}
			});
		}
	});
}

function openRoomsMenu()
{
	socket.emit('rooms', '');
	let interval = setInterval(function(){
		if(rooms != undefined)
		{
			clearInterval(interval);
			printLine("Rooms: ", "green");

			for(let i in rooms)
				printLine(rooms[i].id + " " + rooms[i].name + " (" + rooms[i].users + ")", 'green');

			askForRoom();
		}
	}, 100);
}

/*$.each( data, function( key, val ) {
			printLine(val.id + ": " + val.name + " | " + val.online + "/" + val.members, "green");
		});*/