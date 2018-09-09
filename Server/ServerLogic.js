var NetworkManager = require('./NetworkManager');
var LobbyManager = require('./LobbyManager');
var rmdir = require('rimraf');
var Utility = require('./Utility/Utility');
var CreateFunction = Utility.CreateFunction;

function ServerLogic() {
    this.networkManager = new NetworkManager(this);
    this.lobbyManager = new LobbyManager(this);

    this.gameServerRepositories = ["LeagueSandbox"];

	this.gameServers = [{repository: "LeagueSandbox", branch: "indev"},{repository: "LeagueSandbox", branch: "master"}];

    this.totalLaunchedGameServers = 0;
    this.runningGames = [];

	var updateServerTimer;
	updateServerTimer = CreateFunction(this, function() {
	    this.lookupGameServers();
        setTimeout(updateServerTimer, 1000 * 60 * 1);
    });
    updateServerTimer();
}

ServerLogic.prototype.lookupGameServers = function() {
    const exec = require('child_process').spawn;
    for (var i = 0; i < this.gameServerRepositories.length; i++) {
        let repository = this.gameServerRepositories[i];

        let gameUpdater = exec('AutoCompilerForGameServer.exe',
            ['--gameServerRepository', "https://github.com/"+repository+"/GameServer.git", '--onlyPrintBranches', 'true'],
            {cwd: '../Game-Server-Repositories'});

        let parsingBranches = false;

        gameUpdater.on('error', function(err) {
            console.log('1Oh noez, teh errurz: ' + err);
        });

        gameUpdater.stdout.on('error', function(err) {
            console.log('2Oh noez, teh errurz: ' + err);
        });

        gameUpdater.stderr.on('data', function(err) {
            //Ignore error, it's just a waste to see
        });

        gameUpdater.stdout.on('data', CreateFunction(this, function(data) {
            var dataArray = (""+data).split('\n');
            for (var j = 0; j < dataArray.length; j++) {
                var text = dataArray[j];
                text = text.trim();
                if (text.length == 0) continue;

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

    //Create tempororary folder name
    var d = new Date();
    var fileName = d.getFullYear() + '' + d.getMonth() + '' + d.getDate() + '' + d.getHours() + '' +
        d.getMinutes() + '' + d.getSeconds() + '' + d.getMilliseconds() + '-' + Math.floor((Math.random() * 10000)) + '-' + this.totalLaunchedGameServers;
    console.log("Generating game server with file name: " + fileName);
    messageCallback("Generating game server with file name: " + fileName);

    //--gameServerRepository "https://github.com/LeagueSandbox/GameServer.git" --repositoryBranch "master" --commitMessageName "LastCommitMessage.txt" --gameServerSourceFileName "GameServer Source" --copyBuildToFolder "Compiled GameServer" --needsCopied false --pauseAtEnd true --configJSON ""
    const gameUpdater = exec('AutoCompilerForGameServer.exe', ['--gameServerRepository', "https://github.com/"+repository+"/GameServer.git",
            '--repositoryBranch', branch, '--gameServerSourceFileName', repository+"-"+branch, '--copyBuildToFolder', fileName,
            '--needsCopied', ''+needsCopied, '--pauseAtEnd', 'false', '--needsConfig', 'false', '--onlyPrintBranches', 'false'],
        {cwd: '../Game-Server-Repositories'});

    gameUpdater.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        messageCallback(`stdout: ${data}`);
    });

    gameUpdater.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        messageCallback(`stderr: ${data}`);
    });

    gameUpdater.on('error', function(err) {
        console.log('4Oh noez, teh errurz: ' + err);
    });

    gameUpdater.stdout.on('error', function(err) {
        console.log('5Oh noez, teh errurz: ' + err);
    });

    gameUpdater.stderr.on('data', function(err) {
        console.log('6Oh noez, teh errurz: ' + err);
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

        console.log("Opening game: " + '../Game-Server-Repositories/' + serverName + '/GameServerConsole.exe');
        messageCallback("Opening game: " + '../Game-Server-Repositories/' + serverName + '/GameServerConsole.exe');

        try {
            const game = exec('GameServerConsole.exe', ['--port', port, '--config-json', JSON.stringify(gameJSON)],
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

            game.on('error', function(err) {
                console.log('6Oh noez, teh errurz: ' + err);
            });

            game.stdout.on('error', function(err) {
                console.log('7Oh noez, teh errurz: ' + err);
            });

            game.on('close', (code) => {
                messageCallback(`child process exited with code ${code}`);
                console.log(`child process exited with code ${code}`);

                try {
                    rmdir('../Game-Server-Repositories/'+serverName, function(error){
                        if (error == null) {
                            console.log('Successfully deleted ' + '../Game-Server-Repositories/'+serverName);
                        } else {
                            console.log('Error deleting '+'../Game-Server-Repositories/'+serverName + ', ' + error);
                        }
                    });
                } catch (e) {
                    console.log('Could not delete folder: ' + serverName + ', ' + e);
                }
            });

            setTimeout(() => {
                try {
                    game.kill();
                } catch (e) {
                    console.log('Could not kill process: ' + e);
                }
            }, 1000 * 60 * 60 * 2);
        } catch (e) {
            messageCallback(`Could not start server: ` + e);
            try {
                rmdir('../Game-Server-Repositories/'+serverName, function(error){
                    if (error == null) {
                        console.log('Successfully deleted ' + '../Game-Server-Repositories/'+serverName);
                    } else {
                        console.log('Error deleting '+'../Game-Server-Repositories/'+serverName + ', ' + error);
                    }
                });
            } catch (e) {
                console.log('Could not delete folder: ' + serverName + ', ' + e);
            }
        }
    }));
};

function RunningGame() {
    var id = -1;
    var gameExec = null;
}

var serverInstance = new ServerLogic();