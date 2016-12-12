var NetworkManager = require('./NetworkManager');

function ServerLogic() {
	this.networkManager = new NetworkManager(this);
}

var serverInstance = new ServerLogic();