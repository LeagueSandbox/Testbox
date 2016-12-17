/**
 * Created by Matt on 12/13/2016.
 */

function Lobby() {
    this.id = -1;
    this.name = "";
    this.blueSidePlayers = [];
    this.redSidePlayers = [];
    this.gameServerRepository = 0;
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

Lobby.prototype.buildGameJSON = function() {
    var json = {
        players: [

        ],
        game: {
            map: 1,
            gameMode: "LeagueSandbox-Default"
        },
        gameInfo: {
            MANACOSTS_ENABLED: false,
            COOLDOWNS_ENABLED: false,
            CHEATS_ENABLED: true,
            MINION_SPAWNS_ENABLED: true
        }
    };
    for (var i = 0; i < this.blueSidePlayers.length; i++) {
        var player = this.blueSidePlayers[i];
        json.players.push(
            {
                rank: "DIAMOND",
                name: player.nickname,
                champion: player.selectedChampion,
                team: "BLUE",
                skin: 0,
                summoner1: "HEAL",
                summoner2: "FLASH",
                ribbon: 2,
                icon: 0,
                runes: {
                    //DO NOT CHANGE THESE IF YOU DONT KNOW WHAT YOU ARE DOING.
                    1: 5245,
                    2: 5245,
                    3: 5245,
                    4: 5245,
                    5: 5245,
                    6: 5245,
                    7: 5245,
                    8: 5245,
                    9: 5245,
                    10: 5317,
                    11: 5317,
                    12: 5317,
                    13: 5317,
                    14: 5317,
                    15: 5317,
                    16: 5317,
                    17: 5317,
                    18: 5317,
                    19: 5289,
                    20: 5289,
                    21: 5289,
                    22: 5289,
                    23: 5289,
                    24: 5289,
                    25: 5289,
                    26: 5289,
                    27: 5289,
                    28: 5335,
                    29: 5335,
                    30: 5335
                }
            }
        );
    }
    for (var i = 0; i < this.redSidePlayers.length; i++) {
        var player = this.redSidePlayers[i];
        json.players.push(
            {
                rank: "DIAMOND",
                name: player.nickname,
                champion: player.selectedChampion,
                team: "RED",
                skin: 0,
                summoner1: "HEAL",
                summoner2: "FLASH",
                ribbon: 2,
                icon: 0,
                runes: {
                    //DO NOT CHANGE THESE IF YOU DONT KNOW WHAT YOU ARE DOING.
                    1: 5245,
                    2: 5245,
                    3: 5245,
                    4: 5245,
                    5: 5245,
                    6: 5245,
                    7: 5245,
                    8: 5245,
                    9: 5245,
                    10: 5317,
                    11: 5317,
                    12: 5317,
                    13: 5317,
                    14: 5317,
                    15: 5317,
                    16: 5317,
                    17: 5317,
                    18: 5317,
                    19: 5289,
                    20: 5289,
                    21: 5289,
                    22: 5289,
                    23: 5289,
                    24: 5289,
                    25: 5289,
                    26: 5289,
                    27: 5289,
                    28: 5335,
                    29: 5335,
                    30: 5335
                }
            }
        );
    }
    return json;
};

module.exports = Lobby;