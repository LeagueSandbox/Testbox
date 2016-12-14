var NetworkManager = require('./NetworkManager');
var LobbyManager = require('./LobbyManager');

function ServerLogic() {
	this.networkManager = new NetworkManager(this);
	this.lobbyManager = new LobbyManager(this);
}

ServerLogic.prototype.startGameServer = function(gameJSON, port, callback) {
    const exec = require('child_process').spawn;
    const game = exec('GameServerApp.exe', ['--port', port, '--configJSON', JSON.stringify(gameJSON)], {cwd: '../../GameServer/GameServerApp/bin/Release'});


    var waitingForBoot = true;
    game.stdout.on('data', (data) => {

        console.log(`stdout: ${data}`);
        if (waitingForBoot) {
            if (data.indexOf("Game is ready.") !== -1) {
                console.log("Game is ready, doing callback");
                waitingForBoot = false;
                callback();
            }
        }

    });

    game.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    game.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

};

var serverInstance = new ServerLogic();