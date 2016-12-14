/**
 * Created by Matt on 12/12/2016.
 */
let appLogic;
window.onload = function() {
    appLogic = new AppLogic();
};

function AppLogic() {
    AnimationTimer.startAnimationLoop();
    this.createUI();

    this.appData = new AppData();
    this.networkManager = new NetworkManager(this);
    this.loginPage = new Login(this);
    this.mainPage = new MainPage(this);

    this.showLoginPage();
}

AppLogic.prototype.createUI = function() {
    this.mainDiv = CreateElement({type: 'div', class: 'AppLogic_MainDiv', elements: [
        this.titleDiv = CreateElement({type:'div', class: 'AppLogic_TitleDiv', text: 'League UI (Fully Functional but Worst Looking)'}),
        this.viewDiv = CreateElement({type: 'div', class: 'AppLogic_ViewDiv'})
    ]});
    document.body.appendChild(this.mainDiv);
};

AppLogic.prototype.connectedToServer = function() {
    //Hide login page, show main page, send nickname
    this.loginPage.getDiv().remove();
    this.showMainPage();
    this.mainPage.addToChat("Connected to server as " + this.appData.nickname);
    this.mainPage.addToChat("Please use official Discord chat to discuss development");
    this.networkManager.sendNickname();
};

AppLogic.prototype.showLoginPage = function() {
    this.loginPage.loginButton.disabled = false;
    this.viewDiv.appendChild(this.loginPage.getDiv());
};

AppLogic.prototype.showMainPage = function() {
    this.viewDiv.appendChild(this.mainPage.getDiv());
};

AppLogic.prototype.launchLeagueOfLegends = function(port, playerNum) {
    var leaguePath = this.appData.leaguePath;
    if (leaguePath.substr(leaguePath.length - 1) != "\\") {
        leaguePath = leaguePath + "\\";
    }
    var garenaPath = leaguePath;
    leaguePath = leaguePath + "RADS/solutions/lol_game_client_sln/releases/0.0.1.68/deploy/";
    var leagueExecutable = leaguePath + "League of Legends.exe";
    var garenaExecutable = garenaPath + "League of Legends.exe";
    leaguePath = leaguePath.replaceAll('\\', '/');
    leagueExecutable = leagueExecutable.replaceAll('\\', '/');

    console.log("Starting league with path: " + leaguePath);
    console.log("with executable: " + leagueExecutable);

    console.log("Arguments: " +  this.appData.host+" "+port+" 17BLOhi6KZsTtldTsizvHg== "+playerNum);

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
    if (hasGarenaExecutable) {
        leaguePath = garenaPath;
        leagueExecutable = garenaExecutable;
    }

    const spawn = require('child_process').spawn;
/*
Works but stops loading at 16%
        const game = spawn(leagueExecutable, ["8394", "LoLLauncher.exe", "", "127.0.0.1 "+port+" 17BLOhi6KZsTtldTsizvHg== "+playerNum], {cwd: leaguePath});
*/
//Works after clicking reconnect

    const game = spawn('cmd', ['/c', 'start',"", leagueExecutable,"8394", "LoLLauncher.exe", "", this.appData.host+" "+port+" 17BLOhi6KZsTtldTsizvHg== "+playerNum], {cwd: leaguePath});

};