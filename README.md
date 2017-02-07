# Realtime Messaging Board / Server Terminal
This is realtime messaging board application created in NodeJS with the arcitecture of a server terminal. 

## Client
The client is extremly thin and only supports reading and writing in a text based terminal. It also supports every other functionality you would expect from a terminal. (Arrow up / down / command history etc)

## Server
The server does all the logic, supports a simple command structure and is easily extended for other commands. The currently implemented commands form a fully functional realtime messeging board. The server supports the following commands right now:

* /help
* /name [new name]
* /name
* /join [room name]
* /leave
* /people
* /rooms
* [message]

## Extending the server
As an example for a command take a look at the "/join" command. This command lets a user join an existing room or create a new room. It also checks whether the user has to be checked out of her room and notifies the other users about his leaving and joining.

``` Javascript
//Extending the commands array
commands.push(
	{
        //The description for the help dialog
		disc:"/join [room name]",

        //The regex to recognize the command
		regex:/^\/join ([a-zA-Z0-9]+)$/,

        //The function that is executed
        //You get the user id, the socket of the user
        //and the arguments of the command
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
```

##Dependencies
The NodeJS server uses the following dependencies:

* express
* socket.io