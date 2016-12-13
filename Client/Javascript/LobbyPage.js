/**
 * Created by Matt on 12/13/2016.
 */

function LobbyPage(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({type: 'div', class: 'LobbyPage_MainDiv', elements: [
        this.lobbyListDiv = CreateElement({type: 'div', class: 'LobbyPage_LobbyListDiv', elements: [
            CreateElement({type: 'div', class: 'LobbyPage_LobbyListItem', text: 'Lobbies'})
        ]}),
        this.createLobbyDiv = CreateElement({type: 'div', class: 'LobbyPage_CreateLobbyDiv', elements: [
            CreateElement({type: 'div', class: 'LobbyPage_CreateLobbyButton', elements: [
                CreateElement({type: 'button', text: 'Create', onClick: CreateFunction(this, this.createLobbyButton)})
            ]})
        ]}),
        this.lobbyViewDiv = CreateElement({type: 'div', class: 'LobbyPage_LobbyViewDiv', elements: [
            this.noLobbyDiv = CreateElement({type: 'div', class: 'LobbyPage_NoLobbySelectedDiv', text: 'Please select or create a lobby.'})
        ]})
    ]});

    this.lobbies = [];
}

LobbyPage.prototype.startGame = function(lobbyID) {
    this.appLogic.networkManager.sendStartGame(lobbyID);
};

LobbyPage.prototype.createLobbyButton = function() {
    var name = prompt("Enter name of the new lobby: ", "");

    if (name != null) {
        this.appLogic.networkManager.sendCreateLobby(name);
    }
};

LobbyPage.prototype.lobbyClicked = function(lobby) {
    if (lobby.id == this.appLogic.networkManager.selfLobbyID) return;
    this.appLogic.networkManager.sendEnterLobby(lobby.id);
};

LobbyPage.prototype.updateSelfDisplay = function() {
    var selectedLobbyID = this.appLogic.networkManager.selfLobbyID;

    //Set all lobbies to not selected
    for (var i = 0; i < this.lobbies.length; i++) {
        this.lobbies[i].setSidebarSelected(false);
    }

    var lobby = this.getLobbyForID(selectedLobbyID);
    if (lobby == null) {
        while (this.lobbyViewDiv.hasChildNodes()) {
            this.lobbyViewDiv.removeChild(this.lobbyViewDiv.lastChild);
        }
        this.lobbyViewDiv.appendChild(this.noLobbyDiv);
    } else {
        while (this.lobbyViewDiv.hasChildNodes()) {
            this.lobbyViewDiv.removeChild(this.lobbyViewDiv.lastChild);
        }
        this.lobbyViewDiv.appendChild(lobby.getDiv());
        lobby.setSidebarSelected(true);
    }
};

LobbyPage.prototype.updateLobbyList = function(lobbies) {
    //[{id: lobby.id, name: lobby.name, blueSide: [id], redSide: [id]]
    for (var i = 0; i < lobbies.length; i++) {
        var lobby = this.addLobby(lobbies[i]['id'], lobbies[i]['name']);
        lobby.blueSide = lobbies[i]['blueSide'];
        lobby.redSide = lobbies[i]['redSide'];
        lobby.updateDisplay();
    }
};

LobbyPage.prototype.addLobby = function(id, name) {
    var lobby = new Lobby(this);
    lobby.id = id;
    lobby.name = name;
    this.lobbies.push(lobby);

    lobby.updateDisplay();

    this.lobbyListDiv.appendChild(lobby.getSidebarDiv());

    return lobby;
};

LobbyPage.prototype.removeLobby = function(id) {
    var lobby = this.getLobbyForID(id);
    this.lobbies.splice(this.lobbies.indexOf(lobby), 1);
    lobby.getSidebarDiv().remove();
};

LobbyPage.prototype.updateLobby = function(id, name, blueSide, redSide) {
    var lobby = this.getLobbyForID(id);
    if (lobby == null) return;
    lobby.name = name;
    lobby.blueSide = blueSide;
    lobby.redSide = redSide;
    lobby.updateDisplay();
};

LobbyPage.prototype.updateLobbyPlayer = function(playerID) {
    for (var i = 0; i < this.lobbies.length; i++) {
        if (this.lobbies[i].hasPlayerWithID(playerID)) {
            this.lobbies[i].updateDisplay();
        }
    }
};

LobbyPage.prototype.getDiv = function() {
    return this.mainDiv;
};

LobbyPage.prototype.getLobbyForID = function(id) {
    for (var i = 0; i < this.lobbies.length; i++) {
        var lobby = this.lobbies[i];
        if (lobby.id == id) return lobby;
    }
    return null;
};


function Lobby(lobbyPage) {
    this.lobbyPage = lobbyPage;
    this.id = -1;
    this.name = "";
    this.blueSide = [];
    this.redSide = [];
    this.mainDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_MainDiv', elements: [
        this.titleDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_TitleDiv'}),
        this.blueSideDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_BlueSideDiv'}),
        this.redSideDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_RedSideDiv'}),
        this.startButton = CreateElement({type: 'button', class: 'LobbyPage_Lobby_StartButton',
            text: 'Start Game', onClick: CreateFunction(this, function(){this.lobbyPage.startGame(this.id);})})
    ]});

    this.sideBarDisplayDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_SidebarDisplayDiv', elements:[
        this.sideBarDisplayTitleDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_SidebarDisplayTitleDiv'}),
        this.sideBarDisplayPlayersDiv = CreateElement({type: 'div', class: 'LobbyPage_Lobby_SidebarDisplayPlayersDiv'})
    ]});

    this.sideBarDisplayDiv.onclick = CreateFunction(this, function(){
        this.lobbyPage.lobbyClicked(this);
    });
}

Lobby.prototype.hasPlayerWithID = function(playerID) {
    for (var i = 0; i < this.blueSide.length; i++) {
        if (this.blueSide[i] == playerID) return true;
    }
    for (var i = 0; i < this.redSide.length; i++) {
        if (this.redSide[i] == playerID) return true;
    }
    return false;
};

Lobby.prototype.updateDisplay = function() {
    this.titleDiv.innerText = "Lobby: " + this.name;

    while (this.blueSideDiv.hasChildNodes()) {
        this.blueSideDiv.removeChild(this.blueSideDiv.lastChild);
    }
    while (this.redSideDiv.hasChildNodes()) {
        this.redSideDiv.removeChild(this.redSideDiv.lastChild);
    }
    for (var i = 0; i < this.blueSide.length; i++) {
        var playerID = this.blueSide[i];
        var player = this.lobbyPage.appLogic.networkManager.getPlayerByID(playerID);
        var div = CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemDiv', elements: [
            CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemNameDiv', text: player.nickname}),
            CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemIDDiv', text: player.id}),
            CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemChampionDiv', text: player.selectedChampion})
        ]});
        this.blueSideDiv.appendChild(div);
    }
    for (var i = 0; i < this.redSide.length; i++) {
        var playerID = this.redSide[i];
        var player = this.lobbyPage.appLogic.networkManager.getPlayerByID(playerID);
        var div = CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemDiv', elements: [
            CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemNameDiv', text: player.nickname}),
            CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemIDDiv', text: player.id}),
            CreateElement({type: 'div', class: 'LobbyPage_Lobby_PlayerItemChampionDiv', text: player.selectedChampion})
        ]});
        this.redSideDiv.appendChild(div);
    }

    this.sideBarDisplayTitleDiv.innerText = "("+this.id+")" + " " + this.name;
    this.sideBarDisplayPlayersDiv.innerText = "Players: " + (this.redSide.length + this.blueSide.length);
};

Lobby.prototype.setSidebarSelected = function(selected) {
    if (selected) {
        this.sideBarDisplayDiv.className = "LobbyPage_Lobby_SidebarDisplayDiv LobbyPage_Selected";
    } else {
        this.sideBarDisplayDiv.className = "LobbyPage_Lobby_SidebarDisplayDiv";
    }
};

Lobby.prototype.getSidebarDiv = function() {
    return this.sideBarDisplayDiv;
}

Lobby.prototype.getDiv = function() {
    return this.mainDiv;
};