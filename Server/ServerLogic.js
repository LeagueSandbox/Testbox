var NetworkManager = require('./NetworkManager');
var LobbyManager = require('./LobbyManager');

function ServerLogic() {
	this.networkManager = new NetworkManager(this);
	this.lobbyManager = new LobbyManager(this);

	var updateServerTimer;
	updateServerTimer = CreateFunction(this, function() {
        this.updateGameServer("", function(){
            console.log("Success updating server!");
        });
        setTimeout(updateServerTimer, 1000 * 60 * 5);
    });
	updateServerTimer();
}

ServerLogic.prototype.updateGameServer = function(gameJSON, callback) {
    const exec = require('child_process').spawn;

    //--gameServerRepository "https://github.com/LeagueSandbox/GameServer.git" --repositoryBranch "master" --commitMessageName "LastCommitMessage.txt" --gameServerSourceFileName "GameServer Source" --copyBuildToFolder "Compiled GameServer" --needsCopied false --pauseAtEnd true --configJSON ""
    const gameUpdater = exec('AutoCompilerForGameServer.exe', ['--gameServerRepository', "https://github.com/LeagueSandbox/GameServer.git", '--repositoryBranch', "master", '--commitMessageName', "LastCommitMessage.txt", '--gameServerSourceFileName', "GameServer Source", '--copyBuildToFolder', "Compiled GameServer", '--needsCopied', 'true', '--pauseAtEnd', 'false', '--configJSON', JSON.stringify(gameJSON)],
        {cwd: '../Game-Server-Repositories'});

    gameUpdater.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);

    });

    gameUpdater.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    gameUpdater.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        callback();
    });
};

ServerLogic.prototype.startGameServer = function(gameJSON, port, callback) {
    this.updateGameServer(gameJSON, CreateFunction(this, function () {
        const exec = require('child_process').spawn;

        const game = exec('GameServerApp.exe', ['--port', port, '--configJSON', JSON.stringify(gameJSON)],
            {cwd: '../Game-Server-Repositories/GameServer/GameServerApp/bin/Release'});

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
    }));
};

var serverInstance = new ServerLogic();