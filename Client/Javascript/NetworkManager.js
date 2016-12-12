/**
 * Created by Matt on 12/12/2016.
 */
function NetworkManager(appLogic) {
    this.appLogic = appLogic;
    this.numberOfOnlinePlayers = 0;
    this.numberOfPeopleInGame = 0;
    this.numberOfPeopleInMatchMaking = 0;
    this.numberOfActiveGames = 0;
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
            case "Chat": {
                this.appLogic.mainPage.addToChat(message['text']);
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