function Player(ws)
{
    this.connection = ws;
    this.id = -1;
    this.nickname = "";
    this.selectedChampion = "Ezreal";
    this.inLobby = -1;
}

module.exports = Player;