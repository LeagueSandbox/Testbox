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
    this.networkManager.sendNickname();
};

AppLogic.prototype.showLoginPage = function() {
    this.loginPage.loginButton.disabled = false;
    this.viewDiv.appendChild(this.loginPage.getDiv());
};

AppLogic.prototype.showMainPage = function() {
    this.viewDiv.appendChild(this.mainPage.getDiv());
};