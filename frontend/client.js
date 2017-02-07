$().ready(function(){
	let terminal = new Terminal("inputField", "terminalField");

	//addParticle(terminal);

	baseUrl = "http://moritzg.serpens.uberspace.de/n/";

	let socket = io.connect('http:' + window.location.href.split(":")[1] + ':3001');

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
});