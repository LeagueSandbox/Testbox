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
                CreateElement({type: 'button', text: 'Create', onClick: CreateFunction(this, this.createLobby)})
            ]})
        ]}),
        this.lobbyViewDiv = CreateElement({type: 'div', class: 'LobbyPage_LobbyViewDiv', elements: [
            CreateElement({type: 'div', class: 'LobbyPage_NoLobbySelectedDiv', text: 'Please select or create a lobby.'})
        ]})
    ]});
}

LobbyPage.prototype.createLobby = function() {
    var name = prompt("Enter name of the new lobby: ", "");

    if (name != null) {
        this.appLogic.networkManager.sendCreateLobby(name);
    }
};

LobbyPage.prototype.getDiv = function() {
    return this.mainDiv;
};
