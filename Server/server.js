var onlinePlayers = [];
var currentPlayerID = 0;

var WebSocketServer = require('ws').Server
, wss = new WebSocketServer({ port: 8080 });

console.log("Started server on port 8080");

wss.on('connection', function connection(ws) {
	var player = new Player(ws);
	player.id = currentPlayerID;
	currentPlayerID++;
	console.log("Player connected "+ currentPlayerID);
	console.log("Players online: " + onlinePlayers.length);

	ws.on('message', function incoming(message) {
		//console.log('received: %s', message);
	});

	ws.on('close', () => {
        onlinePlayers.splice(onlinePlayers.indexOf(player), 1);
        console.log("Player disconnected "+ currentPlayerID);
		console.log("Players online: " + onlinePlayers.length);
    });

	//ws.send('something');
});