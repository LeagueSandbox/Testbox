/**
 * Created by Matt on 12/12/2016.
 */
var Player = require('./Player');
var Utility = require('./Utility/Utility');
var CreateFunction = Utility.CreateFunction;

function NetworkManager(serverLogic) {
    this.serverLogic = serverLogic;
    this.onlinePlayers = [];
    this.currentPlayerID = 0;

    var WebSocketServer = require('ws').Server;
    this.websocketServer = new WebSocketServer({ port: 7777 });

    console.log("Started server on port 7777");

    this.websocketServer.on('connection', CreateFunction(this, function connection(ws) {
        var player = new Player(ws);
        player.id = this.currentPlayerID;
        this.currentPlayerID++;
        this.sendToPlayer(player, this.getRepositoryList());
        this.sendToPlayer(player, this.getOnlineList());
        this.sendToPlayer(player, this.getLobbyListMessage());
        this.onlinePlayers.push(player);
        console.log("Player connected "+ this.currentPlayerID);
        console.log("Players online: " + this.onlinePlayers.length);

        this.sendToAll(this.getPlayerOnlineMessage(player));

        ws.on('message', CreateFunction(this, function(messageString) {
            var message = null;
            console.log("Got message: " + messageString);
            try {
                message = JSON.parse(messageString);
            } catch (err) {
                console.log("JSON Parsing error: " + messageString);
                return;
            }
            var messageTitle = message['message'];
            switch(messageTitle) {
                case "Chat" : {
                    this.sendToAll({message: 'Chat', text: player.nickname + ": " + message['text']});
                } break;
                case "Nickname" : {
                    player.nickname = message['name'];
                    this.sendToAll(this.getPlayerNicknameUpdate(player));
                } break;
                case "Enter Lobby" : { //{message: "Enter Lobby", id: id}
                    this.serverLogic.lobbyManager.enterLobby(player, message['id']);
                }break;
                case "Create Lobby" : { //{message: "Create Lobby", name: name}
                    var lobbyID = this.serverLogic.lobbyManager.createLobby(message['name']);
                    this.serverLogic.lobbyManager.enterLobby(player, lobbyID);
                }break;
                case "Champion Select" : { //{message: "Champion Select", champion: champ}
                    player.selectedChampion = message['champion'];
                    this.sendToAll(this.getPlayerSelectedChampionUpdate(player));
                }break;
                case "Skin Select" : { //{message: "Champion Select", champion: champ}
                    player.selectedSkin = message['skinID'];
                }break;
                case "Start Game" : { //{message: "Champion Select", champion: champ}
                    var lobbyID = message['lobbyID'];
                    this.serverLogic.lobbyManager.startGame(lobbyID);
                }break;
                case "Switch Player Side" : { //{message: "Switch Player Side", lobbyID: lobbyID, playerID: playerID}
this.serverLogic.lobbyManager.switchPlayerSide(message['playerID'], message['lobbyID']);
                }break;
                case "Set Lobby Repository" : { //{message: "Set Lobby Repository", lobbyID: lobbyID, repositoryID: repositoryID}
                    this.serverLogic.lobbyManager.setLobbyRepository(message['lobbyID'], message['repositoryID']);
                }break;
            }
        }));

        ws.on('close', CreateFunction(this, () => {
            this.onlinePlayers.splice(this.onlinePlayers.indexOf(player), 1);
            console.log("Player disconnected "+ this.currentPlayerID);
            console.log("Players online: " + this.onlinePlayers.length);
            this.sendToAll(this.getPlayerOfflineMessage(player));
            this.serverLogic.lobbyManager.removePlayerFromLobby(player);
        }));

        //ws.send('something');
    }));

    setTimeout(CreateFunction(this, this.processPlayerServerMessages), 1000.0/60.0);
}

NetworkManager.prototype.processPlayerServerMessages = function() {
    for (var i = 0; i < this.onlinePlayers.length; i++) {
        var player = this.onlinePlayers[i];
        if (player.serverGameLog.length > 0) {
            if (player.serverGameLogStopwatch.getMilliseconds() >= 1000.0 / 20.0) {
                player.serverGameLogStopwatch.reset();
                this.sendToPlayer(player, this.getServerMessage(player.serverGameLog));
                player.serverGameLog = "";
            }
        }
    }
    setTimeout(CreateFunction(this, this.processPlayerServerMessages), 1000.0/60.0);
};

NetworkManager.prototype.getOnlineList = function() {
    var playerList = [];
    for (var i = this.onlinePlayers.length - 1; i >= 0; i--) {
        var player = this.onlinePlayers[i];
        playerList.push({id: player.id, name: player.nickname, selectedChampion: player.selectedChampion});
    }
    return {message: "Online List", players: playerList};
};

NetworkManager.prototype.getRepositoryList = function() {
    return {message: "Repository List", repositories: this.serverLogic.gameServers};
};

NetworkManager.prototype.getStartGame = function(port, playerNum) {
    return {message: "Start Game", port: port, playerNum: playerNum};
};

NetworkManager.prototype.getPlayerNicknameUpdate = function(player) {
    return {message: "Nickname Update", id: player.id, name: player.nickname};
};

NetworkManager.prototype.getWaitingForGameStart = function() {
    return {message: 'Waiting For Game Start'};
};

NetworkManager.prototype.getPlayerSelectedChampionUpdate = function(player) {
    return {message: "Selected Champion Update", id: player.id, selectedChampion: player.selectedChampion};
};
NetworkManager.prototype.getPlayerOnlineMessage = function(player) {
    return {message: "Player Online", id: player.id};
};
NetworkManager.prototype.getPlayerOfflineMessage = function(player) {
    return {message: "Player Offline", id: player.id};
};

NetworkManager.prototype.getSelfInLobbyMessage = function(player) {
    return {message: "Self Lobby", lobbyID: player.inLobby};
};

NetworkManager.prototype.getLobbyListMessage = function() {
    var lobbies = [];
    for (var j = 0; j < this.serverLogic.lobbyManager.lobbies.length; j++) {
        var lobby = this.serverLogic.lobbyManager.lobbies[j];

        var blueSide = [];
        for (var i = 0; i < lobby.blueSidePlayers.length; i++) {
            var p = lobby.blueSidePlayers[i];
            blueSide.push(p.id);
        }
        var redSide = [];
        for (var i = 0; i < lobby.redSidePlayers.length; i++) {
            var p = lobby.redSidePlayers[i];
            redSide.push(p.id);
        }
        lobbies.push({id: lobby.id, name: lobby.name, blueSide: blueSide, redSide: redSide, gameServerRepository: lobby.gameServerRepository});
    }
    return {message: "Lobby List", lobbies: lobbies};
};

NetworkManager.prototype.getLobbyCreateMessage = function(lobby) {
    return {message: "Lobby Created", id: lobby.id, name: lobby.name};
};

NetworkManager.prototype.getLobbyDeleteMessage = function(lobby) {
    return {message: "Lobby Deleted", id: lobby.id};
};

NetworkManager.prototype.addToServerMessageLog = function(player, message) {
    player.serverGameLog = message;//+= message + "\n";
};

NetworkManager.prototype.getServerMessage = function(message) {
    return {message: "Server Starting Log", text: message};
};

NetworkManager.prototype.getLobbyUpdateMessage = function(lobby) {
    var blueSide = [];
    for (var i = 0; i < lobby.blueSidePlayers.length; i++) {
        var p = lobby.blueSidePlayers[i];
        blueSide.push(p.id);
    }
    var redSide = [];
    for (var i = 0; i < lobby.redSidePlayers.length; i++) {
        var p = lobby.redSidePlayers[i];
        redSide.push(p.id);
    }
    return {message: "Lobby Updated", id: lobby.id, name: lobby.name, blueSide: blueSide, redSide: redSide, gameServerRepository: lobby.gameServerRepository};
};

NetworkManager.prototype.sendToAll = function(object) {
    var sendString = JSON.stringify(object);
    for (var i = 0; i < this.onlinePlayers.length; i++) {
        var player = this.onlinePlayers[i];
        if (player.connection.readyState !== OPEN_STATE) continue;
        player.connection.send(sendString);
    }
};
var OPEN_STATE =  require('ws').OPEN;
NetworkManager.prototype.sendToPlayer = function(player, object) {
    if (player.connection.readyState !== OPEN_STATE) return;
    player.connection.send(JSON.stringify(object));
};

module.exports = NetworkManager;