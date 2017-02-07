$().ready(function(){
	
	let terminal = new Terminal("inputField", "terminalField");

	//addParticle(terminal);

	baseUrl = "http://moritzg.serpens.uberspace.de/n/";

	let socket = io.connect('http:' + window.location.href.split(":")[1] + ':3001');
	//let rooms = undefined;

	//let enteredRoom = undefined;

	socket.on('ask', function(msg, awnser){
		if(msg != "")
			terminal.printLine(msg, "green");

		terminal.readLine(function(line){
			awnser(line);
			console.log(line);
		});
	});

	socket.on('print', function(msg){
		terminal.printLine(msg, "green");
	});

	/*socket.on('message', function(msg){
		console.log(msg);
		if(msg.room = enteredRoom.id)
			terminal.printLine(msg.userName + ": " + msg.msg, "green");
	});

	socket.on('set_name', function(msg){
		console.log(msg);
		terminal.printLine("Your name is " + msg.name, "green");
	});

	socket.on('rooms', function(msg){
		console.log(msg);
		rooms = msg;
	});

	terminal.printLine("### Welcome ###", "green");
	terminal.readLine("Set username:", "white", function(line){

		socket.emit('set_name', {name:line});
		openRoomsMenu();
		
	});

	function askForRoom()
	{
		terminal.readLine("Enter room:", "white", function(line){
			
			if(line.startsWith("create "))
			{
				socket.emit("create_room", {name:line.substring("create ".length)});
				openRoomsMenu();
			}
			else
			{
				for(let i in rooms)
					if(rooms[i].id == line){
						enteredRoom = rooms[i];
						break;
					}

				if(enteredRoom == undefined)
				{
					terminal.printLine("Room does not exist", "red");
					openRoomsMenu();
				}
				else
				{
					terminal.printLine("################################", 'green');
					terminal.printLine("Now in room: " + enteredRoom.name, "green");
					terminal.printLine("Type 'exit' to leave", "green");
					terminal.printLine("################################", 'green');
					
					socket.emit('join', {room:enteredRoom.id});
					
					let listener = terminal.addInputListener(function(line){
						if(line != "exit")
						{
							//terminal.printLine("You: " + line, "green");
							socket.emit('message', {room:enteredRoom.id, msg:line});
						}
						else
						{
							enteredRoom = undefined;
							rooms = undefined;
							terminal.removeInputListener(listener);					
							openRoomsMenu();
						}
					});
				}
			}
		});
	}

	function openRoomsMenu()
	{
		socket.emit('leave', '');
		socket.emit('rooms', '');
		let interval = setInterval(function(){
			if(rooms != undefined)
			{
				clearInterval(interval);
				terminal.printLine("################################", 'green');
				terminal.printLine("Enter a room by typing the id", 'green');
				terminal.printLine("or create a room by typing 'create [room name]'", 'green');
				terminal.printLine(" ", "green");
				terminal.printLine("Open rooms: ", "green");

				for(let i in rooms)
				{
					let userNotif = "";
					if(rooms[i].users > 0)
						userNotif = " (" + rooms[i].users + " active)";
					terminal.printLine(rooms[i].id + " " + rooms[i].name + userNotif, 'green');
				}
				terminal.printLine("################################", 'green');

				askForRoom();
			}
		}, 100);
	}*/
});