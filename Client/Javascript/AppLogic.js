/**
 * Created by Matt on 12/12/2016.
 */
const remote = require('electron').remote;

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

    this.gameServerRepositories = [];

    this.showLoginPage();

    //Delay to avoid flashing of the top bar
    window.requestAnimationFrame(function(){
        window.setTimeout(function(){
            window.requestAnimationFrame(function(){
                remote.getCurrentWindow().show();
            });
        }, 500);
    });
}

AppLogic.prototype.createUI = function() {
    this.mainDiv = CreateElement({type: 'div', class: 'AppLogic_MainDiv', elements: [
        this.navbar = CreateElement({type:'nav', class: 'AppLogic_Navbar nav-wrapper row', elements: [
            this.titleDiv = CreateElement({type: 'div', class: 'col s3 left-align', elements: [
                CreateElement({type: 'span', class: 'brand-logo', text: 'League UI'})
            ]}),
            this.center = CreateElement({type: 'div', class: 'col s6 center-align', elements: [
                this.tabNav = CreateElement({type: 'div', elements: [
                    this.playButton = CreateElement({type: 'button', class: 'AppLogic_NavButtonSelected', text: 'Play'}),
                    this.masteriesButton = CreateElement({type: 'button', class: 'AppLogic_NavButton', text: 'Masteries'}),
                    this.runesButton = CreateElement({type: 'button', class: 'AppLogic_NavButton', text: 'Runes'}),
                    this.settingsButton = CreateElement({type: 'button', class: 'AppLogic_NavButton', text: 'Settings'})
                ]}),
            ]}),
            this.rightNav = CreateElement({type: 'div', class: 'col s3 right-align', elements: [
                this.minimize = CreateElement({type: 'span', id: 'min-btn', class: 'fa fa-window-minimize AppLogic_Button'}),
                this.maximize = CreateElement({type: 'span', id: 'max-btn', class: 'fa fa-window-maximize AppLogic_Button'}),
                this.close = CreateElement({type: 'span', id: 'close-btn', class: 'fa fa-window-close AppLogic_Button'})
            ]})
        ]}),
        this.goldBarDiv = CreateElement({type: 'div', class: 'AppLogic_GoldBar'}),
        this.viewDiv = CreateElement({type: 'div', class: 'AppLogic_ViewDiv'})
    ]});
    document.body.appendChild(this.mainDiv);

    document.getElementById("min-btn").addEventListener("click", function (e) {
       var window = remote.getCurrentWindow();
       window.minimize(); 
    });

    document.getElementById("max-btn").addEventListener("click", function (e) {
        var window = remote.getCurrentWindow();
        if (!window.isMaximized()) {
            window.maximize();          
        } else {
            window.unmaximize();
        }
    });

    document.getElementById("close-btn").addEventListener("click", function (e) {
        var window = remote.getCurrentWindow();
        window.close();
    }); 
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
    var mainPage = this.mainPage;
    //For materialize
    $(document).ready(function() {
        $('select').material_select();
        $('.modal').modal();
        $('#selectSkin').on('click', function(e) {
            $('#modalSkin').modal('open');
            $('.carousel').carousel({dist: -30});
            $('.carousel').carousel('set', mainPage.selectedSkin);
        });
        $('#championSelect').on('change', function(e) {
            mainPage.championSelectChange();
        });
        mainPage.championSelectChange();
    });
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
    if (fs.existsSync(leagueExecutable)) {
        hasNormalExecutable = true;
        //alert("Invalid League of Legends path");
        //return;
    }
    if (fs.existsSync(garenaExecutable)) {
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