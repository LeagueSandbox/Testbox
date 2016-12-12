/**
 * Created by Matt on 12/12/2016.
 */

function Login(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({type: 'div', class: 'Login_MainDiv', elements: [
        CreateElement({type: 'div', text: 'League Path: ', class: 'Login_Label'}),
        this.leaguePathInput = CreateElement({type: 'input', class: 'Login_PathInput'}),
        CreateElement({type: 'div', text: 'Nickname: ', class: 'Login_Label'}),
        this.nicknameInput = CreateElement({type: 'input', class: 'Login_NameInput'}),
        CreateElement({type: 'div', text: 'Host: ', class: 'Login_Label'}),
        this.hostInput = CreateElement({type: 'input', class: 'Login_HostInput', text: '127.0.0.1'}),
        CreateElement({type: 'div', text: 'Port: ', class: 'Login_Label'}),
        this.portInput = CreateElement({type: 'input', class: 'Login_PortInput', text: '7777'}),
        this.loginButton = CreateElement({type: 'button', text: 'Login', class: 'Login_Button'
            , onClick: CreateFunction(this, this.loginButtonClicked)})
    ]});
    this.leaguePathInput.placeholder = 'C:\/League-of-Legends-4-20\/';
}
Login.prototype.loginButtonClicked = function() {
    if (this.leaguePathInput.value.length <= 0) {
        alert("Type in League Path");
        return;
    }
    if (this.nicknameInput.value.length <= 0) {
        alert("Type in Nickname (It can be anything)");
        return;
    }
    if (this.hostInput.value.length <= 0) {
        alert("Type in the host, it's the server you want to connect to.");
        return;
    }
    if (this.portInput.value.length <= 0) {
        alert("Type in the port number for the host.");
        return;
    }

    this.loginButton.disabled = true;

    this.appLogic.appData.host = this.hostInput.value;
    this.appLogic.appData.leaguePath = this.leaguePathInput.value;
    this.appLogic.appData.nickname = this.nicknameInput.value;
    this.appLogic.appData.port = this.portInput.value;
    this.appLogic.networkManager.connectToServer();

};

Login.prototype.getDiv = function() {
    return this.mainDiv;
};