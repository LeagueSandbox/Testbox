function Player(ws)
{
    this.connection = ws;
    this.id = -1;
    this.nickname = "";
}

module.exports = Player;