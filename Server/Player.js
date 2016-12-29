var Stopwatch = require('./Utility/Stopwatch');
function Player(ws)
{
    this.connection = ws;
    this.id = -1;
    this.nickname = "";
    this.selectedChampion = "Ezreal";
    this.selectedSkin = 0;
    this.inLobby = -1;
    this.serverGameLog = "";
    this.serverGameLogStopwatch = new Stopwatch();
}

module.exports = Player;