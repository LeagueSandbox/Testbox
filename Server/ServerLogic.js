var NetworkManager = require('./NetworkManager');
var LobbyManager = require('./LobbyManager');

function ServerLogic() {
	this.networkManager = new NetworkManager(this);
	this.lobbyManager = new LobbyManager(this);
}

ServerLogic.prototype.startGameServer = function(gameJSON) {
    const exec = require('child_process').spawn;
    const game = exec('GameServerApp.exe', ['--port', 5223, '--configJSON', JSON.stringify(gameJSON)], {cwd: '../../GameServer/GameServerApp/bin/Debug'});

/*
    game.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    game.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    game.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
    */
};

var serverInstance = new ServerLogic();