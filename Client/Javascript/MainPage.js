/**
 * Created by Matt on 12/12/2016.
 */

function MainPage(appLogic) {
    this.appLogic = appLogic;
    this.selectedSkin = 0;
    this.mainDiv = CreateElement({type: 'div', class: 'MainPage_MainDiv row', elements: [
        CreateElement({type: 'div', class: 'MainPage_LeftSideContainer', elements: [
            this.onlineBoxDiv = CreateElement({type: 'div', class: 'MainPage_OnlineBoxDiv'}),
            this.runningGamesBoxDiv = CreateElement({type: 'div', class: 'MainPage_RunningGamesBoxDiv'})
        ]}),
        this.championDiv = CreateElement({type: 'div', class: 'MainPage_LobbyDiv', elements:
        [
            CreateElement({type: 'div', class: 'MainPage_LobbyContainer', elements: [
                this.championDiv = CreateElement({type: 'div', class: 'MainPage_ChampionDiv row', elements: [
                    this.championSelectDiv = CreateElement({type: 'div', class: 'MainPage_ChampionSelectDiv col s10', elements:
                    [
                        this.championSelect = CreateElement({type: 'select', id: 'championSelect', class: 'MainPage_ChampionSelect icons'}),
                    ]}),
                    this.skinSelectDiv = CreateElement({type: 'button', id: 'selectSkin', class: 'MainPage_ButtonSelectSkin btn col s2', text: 'Select skin'}),
                    this.modalSkin = CreateElement({type: 'div', id: 'modalSkin', class: 'modal modal-fixed-footer', elements: [
                        this.modalSkinContent = CreateElement({type: 'div', class: 'modal-content', elements: [
                            CreateElement({type: 'h4', class: 'center-align', text: 'Select your skin'}),
                            this.carouselSkin = CreateElement({type: 'div', class: 'carousel'})
                        ]}),
                        this.modalSkinFooter = CreateElement({type: 'div', class: 'modal-footer center-align', elements: [
                            CreateElement({type: 'button', class: 'modal-action modal-close waves-effect waves-green btn', text: 'Accept'})
                        ]})
                    ]})
                ]}),
                (this.lobbyPage = new LobbyPage(this.appLogic)).getDiv()
            ]}),
            CreateElement({type: 'div', class: 'MainPage_ChatBox', elements: [  
                this.chatBoxDiv = CreateElement({type: 'div', class: 'MainPage_ChatBoxDiv'}),
                this.chatBoxInput = CreateElement({type: 'input', class: 'MainPage_ChatBoxInput'}),
            ]}),
        ]}),
        
    ]});
    for (var i = 0; i < ChampionList.length; i++) {
        var element = CreateElement({type: 'option', class: 'left circle', value: ChampionList[i], text: ChampionList[i], appendTo: this.championSelect});
        element.setAttribute('data-icon', 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + ChampionList[i] + '.png');
    }
    
    this.championSelect.value = "Ezreal";

    this.chatBoxInput.placeholder = "Type text...";
    this.chatBoxInput.onkeydown = CreateFunction(this, this.chatInputKeyDown);

    this.blockingOverlay = CreateElement({type: 'div', class: 'MainPage_BlockOverlay', text: 'Game Console', elements: [
        this.startingGameDiv = CreateElement({type: 'div', class: 'MainPage_StartingGame'}),
        this.exitGameButton = CreateElement({type: 'button', class: 'MainPage_StartingGame_ExitButton',
        text: "Exit Console Screen", onClick: CreateFunction(this, this.setBlockOverlayOff)})
    ]});

    this.updateOnlineList();
    this.updateRunningGamesList();
}

MainPage.prototype.addServerLog = function(text) {
    var oldHeight = this.startingGameDiv.scrollHeight;
    window.requestAnimationFrame(CreateFunction(this, function() {
        this.startingGameDiv.innerText += text;
        var newHeight = this.startingGameDiv.scrollHeight;
        this.startingGameDiv.scrollTop += newHeight - oldHeight;
    }));
};

MainPage.prototype.setBlockOverlayOn = function() {
    this.startingGameDiv.innerText = "";
    this.mainDiv.appendChild(this.blockingOverlay);
};
MainPage.prototype.setBlockOverlayOff = function() {
    this.blockingOverlay.remove();
};

MainPage.prototype.championSelectChange = function() {
    var champion = this.championSelect.value;
    this.selectedSkin = 0;
    this.appLogic.networkManager.sendChampionSelectChange(champion);
    this.skinChange();
    while (this.carouselSkin.hasChildNodes()) {
        this.carouselSkin.removeChild(this.carouselSkin.lastChild);
    }
    for (var i = 0; i < ExtendedChampionsData[this.championSelect.value].skins.length; i++) {
        var element = CreateElement({type: 'a', id: 'skin'+i, class: 'carousel-item skin' + (i == 0? ' MainPage_ActiveSkin': ''), elements: [
        CreateElement({type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/img/champion/loading/'+this.championSelect.value+'_'+ExtendedChampionsData[this.championSelect.value].skins[i].num+'.jpg'}),
            CreateElement({type: 'div', class: 'center-align', text: ExtendedChampionsData[this.championSelect.value].skins[i].name})
        ], appendTo: this.carouselSkin});
        element.setAttribute('skin', i);    
        let mainPage = this; 
        $("#skin"+i).click(function() {
            $(".skin").removeClass('MainPage_ActiveSkin');
            $("#skin" + $(this).attr('skin')).addClass('MainPage_ActiveSkin');
            mainPage.selectedSkin = $(this).attr('skin');
            mainPage.skinChange();
        });
    }
    this.carouselSkin.setAttribute('class', 'carousel');
    $('.carousel').carousel({dist: -30});
    $('.carousel').carousel('set', 0);
};

MainPage.prototype.skinChange = function() {
    console.log('Change skin to ' + this.selectedSkin);
    this.appLogic.networkManager.sendSkinSelectChange(this.selectedSkin);
};

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
    this.onlineBoxDiv.appendChild(
        CreateElement({type: 'div', class: 'MainPage_OnlinePlayerDiv', elements: [
            CreateElement({type: 'div', class: 'MainPage_OnlinePlayerNameDiv', text: 'Players Online: ' + this.appLogic.networkManager.onlinePlayers.length}),
            this.onlinePlayersCollection = CreateElement({type: 'ul', class: 'collection'})
        ]})
    );
    for (var i = 0; i < this.appLogic.networkManager.onlinePlayers.length; i++) {
        var player = this.appLogic.networkManager.onlinePlayers[i];
        var playerDiv = CreateElement({type: 'li', class: 'MainPage_OnlinePlayerDiv collection-item avatar', elements: [
            CreateElement({type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + player.selectedChampion + '.png', class: 'champion-frame'}),
            CreateElement({type: 'span', class: 'title blue-grey-text truncate', text: player.nickname}),
            CreateElement({type: 'p', class: ' blue-grey-text text-lighten-4', text: player.id})
        ]});
        this.onlinePlayersCollection.appendChild(playerDiv);
    }
    
    this.updateRunningGamesList();
};

MainPage.prototype.updateRunningGamesList = function() {
    while (this.runningGamesBoxDiv.hasChildNodes()) {
        this.runningGamesBoxDiv.removeChild(this.runningGamesBoxDiv.lastChild);
    }
    this.runningGamesBoxDiv.appendChild(
        CreateElement({type: 'div', class: 'MainPage_OnlinePlayerDiv', elements: [
            CreateElement({type: 'div', class: 'MainPage_OnlinePlayerNameDiv', text: 'Running Games: ' + 0}),
            this.runningGamesCollection = CreateElement({type: 'ul', class: 'collection'})
        ]})
    );
    /*
    for (var i = 0; i < this.appLogic.networkManager.onlinePlayers.length; i++) {
        var player = this.appLogic.networkManager.onlinePlayers[i];
        var playerDiv = CreateElement({type: 'li', class: 'MainPage_OnlinePlayerDiv collection-item avatar', elements: [
            CreateElement({type: 'img', src: 'http://ddragon.leagueoflegends.com/cdn/4.20.1/img/champion/' + player.selectedChampion + '.png', class: 'champion-frame'}),
            CreateElement({type: 'span', class: 'title blue-grey-text truncate', text: player.nickname}),
            CreateElement({type: 'p', class: ' blue-grey-text text-lighten-4', text: player.id})
        ]});
        this.runningGamesCollection.appendChild(playerDiv);
    }*/
};

MainPage.prototype.getDiv = function() {
    return this.mainDiv;
};

fs = require('fs');
var ChampionList = JSON.parse(fs.readFileSync('resources/app.asar/assets/ChampionList.json'));
var ExtendedChampionsData = JSON.parse(fs.readFileSync('resources/app.asar/assets/ExtendedChampionList.json'));
