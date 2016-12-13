/**
 * Created by Matt on 12/13/2016.
 */
var Lobby = require('./Lobby');

function LobbyManager(serverLogic) {
    this.serverLogic = serverLogic;
    this.currentLobbyID = 0;
    this.lobbies = [];
}
LobbyManager.prototype.createLobby = function(name) {
    var lobby = new Lobby();
    lobby.id = this.currentLobbyID;
    this.currentLobbyID++;
    lobby.name = name;
    if (name == "") lobby.name = lobby.id + '';
    this.lobbies.unshift(lobby);

    this.serverLogic.networkManager.sendToAll(this.serverLogic.networkManager.getLobbyCreateMessage(lobby));

    return lobby.id;
};
LobbyManager.prototype.enterLobby = function(player, lobbyID) {
    this.removePlayerFromLobbies(player);

    var lobby = this.getLobbyForID(lobbyID);
    if (lobby == null) return;
    lobby.blueSidePlayers.push(player);

    this.serverLogic.networkManager.sendToAll(this.serverLogic.networkManager.getLobbyUpdateMessage(lobby));
};
LobbyManager.prototype.removePlayerFromLobby = function(player) {
    if (player.inLobby == -1) return;
    var lobby = this.getLobbyForID(player.inLobby);
    if (lobby == null) return;
    lobby.removePlayerFromLobby(player);

    this.serverLogic.networkManager.sendToAll(this.serverLogic.networkManager.getLobbyUpdateMessage(lobby));

    this.server.networkManager.sendToPlayer(player, this.server.networkManager.getSelfInLobbyMessage(player));

    if (lobby.getNumberOfPlayers() == 0) {
        this.deleteLobby(lobby);
    }
};

LobbyManager.prototype.deleteLobby = function(lobby) {
    //Remove all players from lobby
    while(lobby.blueSidePlayers.length > 0) {
        var p = lobby.blueSidePlayers[i];
        lobby.removePlayerFromLobby(p);
        this.server.networkManager.sendToPlayer(p, this.server.networkManager.getSelfInLobbyMessage(p));
    }
    while(lobby.redSidePlayers.length > 0) {
        var p = lobby.redSidePlayers[i];
        lobby.removePlayerFromLobby(p);
        this.server.networkManager.sendToPlayer(p, this.server.networkManager.getSelfInLobbyMessage(p));
    }
    this.lobbies.splice(this.lobbies.indexOf(lobby), 1);

    this.serverLogic.networkManager.sendToAll(this.serverLogic.networkManager.getLobbyDeleteMessage(lobby));
};

LobbyManager.prototype.startLobby = function(id) {
    var lobby = this.getLobbyForID(id);
    if (lobby == null) return;

    this.deleteLobby(lobby);
}

LobbyManager.prototype.getLobbyForID = function(id) {
    for (var i = 0; i < this.lobbies.length; i++) {
        var lobby = this.lobbies[i];
        if (lobby.id == id) return lobby;
    }
    return null;
};

module.exports = LobbyManager;