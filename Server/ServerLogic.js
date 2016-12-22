var NetworkManager = require('./NetworkManager');
var LobbyManager = require('./LobbyManager');
var Utility = require('./Utility/Utility');
var CreateFunction = Utility.CreateFunction;

function ServerLogic() {
    this.networkManager = new NetworkManager(this);
    this.lobbyManager = new LobbyManager(this);

    this.gameServerRepositories = ["LeagueSandbox", "MatthewFrench"];

	this.gameServers = [];

    this.totalLaunchedGameServers = 0;
    this.runningGames = [];

	var updateServerTimer;
	updateServerTimer = CreateFunction(this, function() {
	    this.lookupGameServers();
        setTimeout(updateServerTimer, 1000 * 60 * 5);
    });
    updateServerTimer();
}

ServerLogic.prototype.lookupGameServers = function() {
    const exec = require('child_process').spawn;
    console.log("Looking up game servers");
    for (var i = 0; i < this.gameServerRepositories.length; i++) {
        let repository = this.gameServerRepositories[i];
        console.log("Looking at game server: " + repository);

        let gameUpdater = exec('AutoCompilerForGameServer.exe',
            ['--gameServerRepository', "https://github.com/"+repository+"/GameServer.git", '--onlyPrintBranches', 'true'],
            {cwd: '../Game-Server-Repositories'});

        let parsingBranches = false;

        gameUpdater.stdout.on('data', CreateFunction(this, function(data) {
            var dataArray = (""+data).split('\n');
            for (var j = 0; j < dataArray.length; j++) {
                var text = dataArray[j];
                text = text.trim();
                if (text.length == 0) continue;
                console.log("J: " + j + " Text: "+ text + ", length: " + text.length);

                if (parsingBranches == false) {
                    if ((text.indexOf("Repository Branches:") !== -1)) {
                        parsingBranches = true;
                        return;
                    }
                }
                if (parsingBranches) {
                    if ((text.indexOf("End Repository Branches") !== -1)) {
                        parsingBranches = false;
                        return;
                    }
                    //Must be branch
                    this.addGameServer(repository, text);
                }
            }
        }));
    }
};

ServerLogic.prototype.addGameServer = function(repository, branch) {
    console.log("Got branch: " + repository + "/" + branch);
    //Add to list if doesn't exist and update clients
    if (this.gameServerExists(repository, branch) == false) {
        this.gameServers.push({repository : repository, branch: branch});
        this.networkManager.sendToAll(this.networkManager.getRepositoryList());

        //this.updateGameServer(repository, branch, "", false, function(t){}, function(){
        //    console.log("Success updating server!");
        //});
    }
};

ServerLogic.prototype.gameServerExists = function(repository, branch) {
    for (var i = 0; i < this.gameServers.length; i++) {
        var s = this.gameServers[i];
        if (s['repository'] == repository && s['branch'] == branch) return true;
    }
    return false;
};

ServerLogic.prototype.updateGameServer = function (repository, branch, gameJSON, needsCopied, messageCallback, callback) {
    const exec = require('child_process').spawn;

    this.totalLaunchedGameServers++;
89-0
    //Create tempororary folder name
    var d = new Date();
    var fileName = d.getFullYear() + '' + d.getMonth() + '' + d.getDate() + '' + d.getHours() + '' +
        d.getMinutes() + '' + d.getSeconds() + '' + d.getMilliseconds() + '-' + Math.floor((Math.random() * 10000)) + '-' + this.totalLaunchedGameServers;
    console.log("Generating game server with file name: " + fileName);
    messageCallback("Generating game server with file name: " + fileName);

    //--gameServerRepository "https://github.com/LeagueSandbox/GameServer.git" --repositoryBranch "master" --commitMessageName "LastCommitMessage.txt" --gameServerSourceFileName "GameServer Source" --copyBuildToFolder "Compiled GameServer" --needsCopied false --pauseAtEnd true --configJSON ""
    const gameUpdater = exec('AutoCompilerForGameServer.exe', ['--gameServerRepository', "https://github.com/"+repository+"/GameServer.git", '--repositoryBranch', branch, '--gameServerSourceFileName', repository+"-"+branch, '--copyBuildToFolder', fileName, '--needsCopied', ''+needsCopied, '--pauseAtEnd', 'false', '--needsConfig', 'false', '--onlyPrintBranches', 'false'],
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

ServerLogic.prototype.startGameServer = function (repository, branch, gameJSON, port, messageCallback, callback) {
    this.updateGameServer(repository, branch, gameJSON, true, messageCallback, CreateFunction(this, function (serverName) {
        const exec = require('child_process').spawn;

        console.log("Opening game: " + '../Game-Server-Repositories/' + serverName + '/GameServerApp.exe');
        messageCallback("Opening game: " + '../Game-Server-Repositories/' + serverName + '/GameServerApp.exe');

        const game = exec('GameServerApp.exe', ['--port', port, '--config-json', JSON.stringify(gameJSON)],
            {cwd: '../Game-Server-Repositories/' + serverName});

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

function RunningGame() {
    var id = -1;
    var gameExec = null;
}

var serverInstance = new ServerLogic();