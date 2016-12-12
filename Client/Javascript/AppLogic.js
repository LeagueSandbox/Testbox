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
    this.connectToServer();
}

AppLogic.prototype.createUI = function() {
    this.mainDiv = CreateElement({type: 'div', class: 'AppLogic_MainDiv', elements: [
        this.titleDiv = CreateElement({type:'div', class: 'AppLogic_TitleDiv', text: 'League UI'})
    ]});
    document.body.appendChild(this.mainDiv);
};
AppLogic.prototype.connectToServer = function() {

};