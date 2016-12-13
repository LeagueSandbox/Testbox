/**
 * Created by Matt on 12/12/2016.
 */
function NetworkManager(appLogic) {
    this.appLogic = appLogic;
    this.onlinePlayers = [];
    this.selfID = -1;

    this.ws = null;
}

NetworkManager.prototype.connectToServer = function() {
    this.ws = new WebSocket("ws://"+this.appLogic.appData.host+":"+this.appLogic.appData.port+"/");

    this.ws.onopen = CreateFunction(this, function()
    {
        // Web Socket is connected, send data using send()
        //this.ws.send("Message to send");
        this.appLogic.connectedToServer();
    });

    this.ws.onmessage = CreateFunction(this, function (evt)
    {
        var received_msg = evt.data;
        var message = JSON.parse(received_msg);
        var messageTitle = message['message'];
        switch (messageTitle) {
            case "Chat": { //{message: "Chat", text: String};
                this.appLogic.mainPage.addToChat(message['text']);
            }break;
            case "Online List": { //{message: "Online List", players: {id:Number, name: String}}
                this.onlinePlayers = [];
                var players = message['players'];
                for (var i = 0; i < players.length; i++) {
                    var p = players[i];
                    var newPlayer = new Player();
                    newPlayer.id = p['id'];
                    newPlayer.nickname = p['name'];
                    this.onlinePlayers.push(newPlayer);
                }
                this.appLogic.mainPage.updateOnlineList();
            }
            break;
            case "Nickname Update": {//{message: "Nickname Update", id: player.id, name: player.nickname};
                for (var i = 0; i < this.onlinePlayers.length; i++) {
                    var p = this.onlinePlayers[i];
                    if (p.id == message['id']) {
                        p.nickname = message['name'];
                    }
                }
                this.appLogic.mainPage.updateOnlineList();
            }break;
            case "Player Online": {//{message: "Player Online", id: player.id};
                var p = new Player();
                p.id = message['id'];
                p.nickname = p.id + '';
                this.onlinePlayers.push(p);
                this.appLogic.mainPage.updateOnlineList();
            }break;
            case "Player Offline": {//{message: "Player Offline", id: player.id};
                for (var i = 0; i < this.onlinePlayers.length; i++) {
                    var p = this.onlinePlayers[i];
                    if (p.id == message['id']) {
                        this.onlinePlayers.splice(i, 1);
                        break;
                    }
                }
                this.appLogic.mainPage.updateOnlineList();
            }break;
        }
    });

    this.ws.onclose = CreateFunction(this, function()
    {
        // websocket is closed.
        this.appLogic.mainPage.getDiv().remove();
        this.appLogic.showLoginPage();
    });
};

NetworkManager.prototype.sendNickname = function() {
    this.send({message: "Nickname", name: this.appLogic.appData.nickname});
};

NetworkManager.prototype.sendChat = function(chat) {
    this.send({message: "Chat", text: chat});
};

NetworkManager.prototype.send = function(object) {
    this.ws.send(JSON.stringify(object));
};

function Player() {
    this.id = -1;
    this.nickname = "";
}