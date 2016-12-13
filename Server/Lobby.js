/**
 * Created by Matt on 12/13/2016.
 */

function Lobby() {
    this.id = -1;
    this.name = "";
    this.blueSidePlayers = [];
    this.redSidePlayers = [];
}
Lobby.prototype.removePlayer = function(player) {
    var i = this.blueSidePlayers.indexOf(player);
    if (i > -1) this.blueSidePlayers.splice(i, 1);
    i = this.redSidePlayers.indexOf(player);
    if (i > -1) this.redSidePlayers.splice(i, 1);
    player.inLobby = -1;
};
Lobby.prototype.getNumberOfPlayers = function() {
    return this.blueSidePlayers.length + this.redSidePlayers.length;
};

module.exports = Lobby;