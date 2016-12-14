/**
 * Created by Matt on 12/12/2016.
 */

function MainPage(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({type: 'div', class: 'MainPage_MainDiv', elements: [
        this.chatBoxDiv = CreateElement({type: 'div', class: 'MainPage_ChatBoxDiv'}),
        this.chatBoxInput = CreateElement({type: 'input', class: 'MainPage_ChatBoxInput'}),
        this.onlineBoxDiv = CreateElement({type: 'div', class: 'MainPage_OnlineBoxDiv'})
    ]});
    this.chatBoxInput.placeholder = "Type text...";
    this.chatBoxInput.onkeydown = CreateFunction(this, this.chatInputKeyDown);
}

MainPage.prototype.chatInputKeyDown = function(e) {
    if (e.keyCode == 13) {
        this.appLogic.networkManager.sendChat(this.chatBoxInput.value);
        this.chatBoxInput.value = "";
    }
};

MainPage.prototype.addToChat = function(chat) {
    var oldHeight = this.chatBoxDiv.scrollHeight;
    this.chatBoxDiv.innerText += chat + '\n';
    window.requestAnimationFrame(CreateFunction(this, function() {
        var newHeight = this.chatBoxDiv.scrollHeight;
        this.chatBoxDiv.scrollTop += newHeight - oldHeight;
    }));
};

MainPage.prototype.updateOnlineList = function() {
    while (this.onlineBoxDiv.hasChildNodes()) {
        this.onlineBoxDiv.removeChild(this.onlineBoxDiv.lastChild);
    }
    var d = CreateElement({type: 'div', class: 'MainPage_OnlinePlayerDiv', elements: [
        CreateElement({type: 'div', class: 'MainPage_OnlinePlayerNameDiv', text: 'Online: ' + this.appLogic.networkManager.onlinePlayers.length})
    ]});
    this.onlineBoxDiv.appendChild(d);
    for (var i = 0; i < this.appLogic.networkManager.onlinePlayers.length; i++) {
        var player = this.appLogic.networkManager.onlinePlayers[i];
        var playerDiv = CreateElement({type: 'div', class: 'MainPage_OnlinePlayerDiv', elements: [
            CreateElement({type: 'div', class: 'MainPage_OnlinePlayerIDDiv', text: player.id}),
            CreateElement({type: 'div', class: 'MainPage_OnlinePlayerNameDiv', text: player.nickname})
        ]});
        this.onlineBoxDiv.appendChild(playerDiv);
    }
};

MainPage.prototype.getDiv = function() {
    return this.mainDiv;
}