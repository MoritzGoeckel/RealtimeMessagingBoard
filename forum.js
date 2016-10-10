setMaxLines(10);

printLine("### Welcome ###", "hig");

choosRoomMenu();

addInputListener(function(line){ 

	nextState(line);

});

setInterval(pullMessages, 3000);

function choosRoomMenu()
{
	currentRoom = "none";
	lastSeenMessageIdInRoom = new Array();
	printLine("Choose room", "imp");
	nextState = openChat;
	
	$.getJSON( "http://localhost:3000/rooms", function( data ) {
		$.each( data, function( key, val ) {
			printLine(val.id + ": " + val.name + " | " + val.online + "/" + val.members, "hig");
		});
	});
}

lastSeenMessageIdInRoom = new Array();
function openChat(line)
{
	printLine("Entering " + line, "imp");
	nextState = inChat;
	
	currentRoom = line;
	lastSeenMessageIdInRoom[""+currentRoom] = -1;

	pullMessages();
}

function pullMessages()
{
	if(currentRoom != "none")
	{
		$.getJSON( "http://localhost:3000/msgs/" + currentRoom, function( data ) {
			$.each( data, function( key, val ) {
				if(val.msgid > lastSeenMessageIdInRoom[currentRoom])
				{
					printLine(val.username + ": " + val.content, "hig");
					lastSeenMessageIdInRoom[currentRoom] = val.msgid;
				}
				
			});
		});
	}
}

currentRoom = "none";
function inChat(line)
{
	if(line == "exit")
		choosRoomMenu();
	else if(line == "pull")
		pullMessages();
	else 
	{
		//Write msg
		var msg = {
			"userid": -1,
			"content": line
		};
		
		$.post( "http://localhost:3000/insertmsg/" + currentRoom, (JSON.stringify(msg))); //encodeURIComponent
		pullMessages();
	}
}