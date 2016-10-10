const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

nextUserId = 0;
nextRoomId = 0;
nextMessageId = 0;

rooms = [
	{
		"name": "Info",
		"id": nextRoomId++,
		"members": 0,
		"online": 0
	},
	{
		"name": "Spam",
		"id": nextRoomId++,
		"members": 0,
		"online": 0
	}
];

//First dimension is the roomid
msgs = [
	[
		{
			"username": "System",
			"userid": nextUserId++,
			"content": "Keep on believing, have fun during the day and make all the things",
			"msgid": nextMessageId++,
			"date": "2015-07-25T01:44:31 -09:00"
		}
	],
	[
	
	]
];

const server = http.createServer((req, res) => {
	
	var path = req.url;
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/json');
	res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	
	console.log("Request for -> " + path);
	if(path == undefined)
		res.end("Undefined request... :)\n");
	else if(path == "/rooms")
		res.end(JSON.stringify(rooms));
	else if(path.startsWith("/msgs/"))
	{
		var params = path.split("/");
		var id = params[params.length - 1];
		console.log("Delivering id: " + id);
		res.end(JSON.stringify(msgs[id]));
	}
	else if(path.startsWith("/insertmsg/") && req.method == 'POST')
	{
		var params = path.split("/");
		var id = params[params.length - 1];
		
		req.on('data', function (data) {
			data = (data); //decodeURIComponent
			
			var jsonObject = JSON.parse(data);
			
			jsonObject.username = "Anonymous";
			jsonObject.date = new Date().toUTCString();
			jsonObject.msgid = nextMessageId++;
			
			console.log("Insert Msg:");
			console.log(jsonObject); 
			
			msgs[id].unshift(jsonObject);
			
			req.connection.destroy();
		});
		
		res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Recieved msg');
	}
	else
		res.end("Not found... :)\n");
});

server.listen(port, hostname, () => {
  console.log('Server running at http://${hostname}:${port}/');
});