/**
 * Created by Matt on 12/12/2016.
 */

function Login(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({type: 'div', class: 'Login_MainDiv container center-align', elements: [
        CreateElement({type: 'div', text: 'League Path', class: 'Login_Label'}),
        this.leaguePathInput = CreateElement({type: 'input', class: 'Login_PathInput input-text'}),
        CreateElement({type: 'div', text: 'Nickname', class: 'Login_Label'}),
        this.nicknameInput = CreateElement({type: 'input', class: 'Login_NameInput input-text'}),
        CreateElement({type: 'div', text: 'Host', class: 'Login_Label'}),
        this.hostInput = CreateElement({type: 'input', class: 'Login_HostInput input-text', text: '104.168.222.21'}),
        CreateElement({type: 'div', text: 'Port', class: 'Login_Label'}),
        this.portInput = CreateElement({type: 'input', class: 'Login_PortInput input-text', text: '7777'}),
        this.loginButton = CreateElement({type: 'button', text: 'Login', class: 'Login_Button btn-large'
            , onClick: CreateFunction(this, this.loginButtonClicked)})
    ]});
    this.leaguePathInput.placeholder = 'C:\/League-of-Legends-4-20\/';

    if (localStorage.getItem("path") != undefined && localStorage.getItem("path") != "") {
        this.leaguePathInput.value = localStorage.getItem("path");
    }
    if (localStorage.getItem("host") != undefined && localStorage.getItem("host") != "") {
        this.hostInput.value = localStorage.getItem("host");
    }
    if (localStorage.getItem("port") != undefined && localStorage.getItem("port") != "") {
        this.portInput.value = localStorage.getItem("port");
    }
    if (localStorage.getItem("name") != undefined && localStorage.getItem("name") != "") {
        this.nicknameInput.value = localStorage.getItem("name");
    }
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

    //Check if league of legends exists
    var leaguePath = this.leaguePathInput.value;
    if (leaguePath.substr(leaguePath.length - 1) != "\\") {
        leaguePath = leaguePath + "\\";
    }
    var garenaPath = leaguePath;
    leaguePath = leaguePath + "RADS/solutions/lol_game_client_sln/releases/0.0.1.68/deploy/";
    var leagueExecutable = leaguePath + "League of Legends.exe";
    var garenaExecutable = garenaPath + "League of Legends.exe";
    leaguePath = leaguePath.replaceAll('\\', '/');
    leagueExecutable = leagueExecutable.replaceAll('\\', '/');

    var hasNormalExecutable = false;
    var hasGarenaExecutable = false;
    var fs = require('fs');
    if (!fs.existsSync(leagueExecutable)) {
        hasNormalExecutable = true;
        //alert("Invalid League of Legends path");
        //return;
    }
    if (!fs.existsSync(garenaExecutable)) {
        hasGarenaExecutable = true;
    }
    if (hasNormalExecutable == false && hasGarenaExecutable == false) {
        alert("Invalid League of Legends path");
        return;
    }

    this.loginButton.disabled = true;

    this.appLogic.appData.host = this.hostInput.value;
    this.appLogic.appData.leaguePath = this.leaguePathInput.value;
    this.appLogic.appData.nickname = this.nicknameInput.value;
    this.appLogic.appData.port = this.portInput.value;
    this.appLogic.networkManager.connectToServer();

    localStorage.setItem("host", this.hostInput.value);
    localStorage.setItem("path", this.leaguePathInput.value);
    localStorage.setItem("name", this.nicknameInput.value);
    localStorage.setItem("port", this.portInput.value);
};

Login.prototype.getDiv = function() {
    return this.mainDiv;
};