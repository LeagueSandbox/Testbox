var NetworkManager = require('./NetworkManager');
var LobbyManager = require('./LobbyManager');

function ServerLogic() {
	this.networkManager = new NetworkManager(this);
	this.lobbyManager = new LobbyManager(this);
}

var serverInstance = new ServerLogic();