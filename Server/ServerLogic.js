var NetworkManager = require('./NetworkManager');
var LobbyManager = require('./LobbyManager');
var Utility = require('./Utility/Utility');
var CreateFunction = Utility.CreateFunction;

function ServerLogic() {
	this.networkManager = new NetworkManager(this);
	this.lobbyManager = new LobbyManager(this);

	this.gameServers = [];
    this.gameServers.push({repository:"LeagueSandbox", branch: "Master"});
	this.gameServers.push({repository:"MatthewFrench", branch: "Master"});

	var updateServerTimer;
	updateServerTimer = CreateFunction(this, function() {
        this.updateAllGameServers();
        setTimeout(updateServerTimer, 1000 * 60 * 5);
    });
	updateServerTimer();
}

ServerLogic.prototype.updateAllGameServers = function() {
    for (var i = 0; i < this.gameServers.length; i++) {
        var gs = this.gameServers[i];
        this.updateGameServer(gs['repository'], gs['branch'], "", false, function(t){}, function(){
            console.log("Success updating server!");
        });
    }
};

ServerLogic.prototype.updateGameServer = function(repository, branch, gameJSON, needsCopied, messageCallback, callback) {
    const exec = require('child_process').spawn;

    //Create tempororary folder name
    var d = new Date();
    var fileName = d.getFullYear()+''+d.getMonth()+''+d.getDate()+''+d.getHours()+''+
        d.getMinutes()+''+d.getSeconds()+''+d.getMilliseconds()+'-'+Math.floor((Math.random() * 10000))+'-'+this.totalLaunchedGameServers;
    console.log("Generating game server with file name: " + fileName);
    messageCallback("Generating game server with file name: " + fileName);

    //--gameServerRepository "https://github.com/LeagueSandbox/GameServer.git" --repositoryBranch "master" --commitMessageName "LastCommitMessage.txt" --gameServerSourceFileName "GameServer Source" --copyBuildToFolder "Compiled GameServer" --needsCopied false --pauseAtEnd true --configJSON ""
    const gameUpdater = exec('AutoCompilerForGameServer.exe', ['--gameServerRepository', "https://github.com/"+repository+"/GameServer.git", '--repositoryBranch', branch, '--gameServerSourceFileName', repository+"-"+branch, '--copyBuildToFolder', fileName, '--needsCopied', ''+needsCopied, '--pauseAtEnd', 'false', '--needsConfig', 'false'],
        {cwd: '../Game-Server-Repositories'});

    gameUpdater.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        messageCallback(`stdout: ${data}`);
    });

    gameUpdater.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        messageCallback(`stderr: ${data}`);
    });

    gameUpdater.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        messageCallback(`child process exited with code ${code}`);
        callback(fileName);
    });
};

ServerLogic.prototype.startGameServer = function(repository, branch, gameJSON, port, messageCallback, callback) {
    this.updateGameServer(repository, branch, gameJSON, true, messageCallback, CreateFunction(this, function (serverName) {
        const exec = require('child_process').spawn;

        console.log("Opening game: " + '../Game-Server-Repositories/'+serverName+'/GameServerApp.exe');
        messageCallback("Opening game: " + '../Game-Server-Repositories/'+serverName+'/GameServerApp.exe');

        const game = exec('GameServerApp.exe', ['--port', port, '--config-json', JSON.stringify(gameJSON)],
            {cwd: '../Game-Server-Repositories/'+serverName});

        var waitingForBoot = true;
        game.stdout.on('data', (data) => {
            messageCallback(`stdout: ${data}`);

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
            messageCallback(`stdout: ${data}`);
            console.log(`stdout: ${data}`);
        });

        game.on('close', (code) => {
            messageCallback(`child process exited with code ${code}`);
            console.log(`child process exited with code ${code}`);

            //var rmdir = require('rimraf');
            //rmdir('../Game-Server-Repositories/'+serverName, function(error){
            //    console.log('Error deleting '+'../Game-Server-Repositories/'+serverName);
            //});
            //Delete old server
            //rmdir example /s
        });
    }));
};

var serverInstance = new ServerLogic();