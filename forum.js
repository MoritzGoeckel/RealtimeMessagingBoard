setMaxLines(10);

printLine("### Welcome ###", "hig");

choosRoomMenu();

addInputListener(function(line){ 

	nextState(line);

});

function choosRoomMenu()
{
	printLine("Choose room", "imp");
	nextState = openChat;
	
	$.getJSON( "http://localhost:3000/rooms", function( data ) {
		$.each( data, function( key, val ) {
			printLine(val.id + ": " + val.name + " | " + val.online + "/" + val.members, "hig");
		});
	});
}

function openChat(line)
{
	printLine("Entering " + line, "imp");
	nextState = inChat;
	
	currentRoom = line;
	
	$.getJSON( "http://localhost:3000/msgs/" + line, function( data ) {
		$.each( data, function( key, val ) {
			printLine(val.username + ": " + val.content, "hig");
		});
	});
}

currentRoom = "none";
function inChat(line)
{
	if(line == "exit")
		choosRoomMenu();
	else 
	{
		//Write msg
		var msg = {
			"userid": -1,
			"content": line
		};
		
		$.post( "http://localhost:3000/insertmsg/" + currentRoom, (JSON.stringify(msg))); //encodeURIComponent
	}
}