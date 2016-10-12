baseUrl = "http://moritzg.serpens.uberspace.de/n/";

setMaxLines(10);

printLine("### Welcome ###", "blue");

choosRoomMenu();

addInputListener(function(line){ 

	nextState(line);

});

setInterval(pullMessages, 3000);

function choosRoomMenu()
{
	currentRoom = "none";
	lastSeenMessageIdInRoom = new Array();
	printLine("Choose room", "blue");
	nextState = openChat;
	
	$.getJSON( baseUrl + "rooms", function( data ) {
		$.each( data, function( key, val ) {
			printLine(val.id + ": " + val.name + " | " + val.online + "/" + val.members, "green");
		});
	});
}

lastSeenMessageIdInRoom = new Array();
function openChat(line)
{
	//Todo check whether room exists
	
	printLine("Entering " + line, "blue");
	nextState = inChat;
	
	currentRoom = line;
	lastSeenMessageIdInRoom[""+currentRoom] = -1;

	pullMessages();
}

function pullMessages()
{
	if(currentRoom != "none")
	{
		$.getJSON( baseUrl + "msgs/" + currentRoom, function( data ) {
			$.each( data, function( key, val ) {
				if(val.msgid > lastSeenMessageIdInRoom[currentRoom])
				{
					printLine(val.username + ": " + val.content, "green");
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
		
		$.post( baseUrl + "insertmsg/" + currentRoom, (JSON.stringify(msg))); //encodeURIComponent
		pullMessages();
	}
}