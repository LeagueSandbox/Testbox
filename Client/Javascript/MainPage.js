/**
 * Created by Matt on 12/12/2016.
 */

function MainPage(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({type: 'div', class: 'MainPage_MainDiv row', elements: [
        this.onlineBoxDiv = CreateElement({type: 'div', class: 'MainPage_OnlineBoxDiv col s3'}),
        this.championDiv = CreateElement({type: 'div', class: 'MainPage_LobbyDiv col s9', elements:
        [
            CreateElement({type: 'div', class: 'MainPage_LobbyContainer', elements: [
                this.championDiv = CreateElement({type: 'div', class: 'MainPage_ChampionDiv input-field', elements:
                [
                    this.championSelect = CreateElement({type: 'select', id: 'championSelect', class: 'MainPage_ChampionSelect icons'}),
                    this.championSelectLabel = CreateElement({type: 'label', text: 'Select your champion'}),
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

    this.blockingOverlay = CreateElement({type: 'div', class: 'MainPage_BlockOverlay', text: 'Game is Starting', elements: [
        this.startingGameDiv = CreateElement({type: 'div', class: 'MainPage_StartingGame'})
    ]});
}

MainPage.prototype.addServerLog = function(text) {
    var oldHeight = this.startingGameDiv.scrollHeight;
    this.startingGameDiv.innerText += text;
    window.requestAnimationFrame(CreateFunction(this, function() {
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
    this.appLogic.networkManager.sendChampionSelectChange(champion);
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
};

MainPage.prototype.getDiv = function() {
    return this.mainDiv;
}

var ChampionList = [
    "Aatrox",
    "Ahri",
    "Akali",
    "Alistar",
    "Amumu",
    "Anivia",
    "Annie",
    "Ashe",
    "Azir",
    "Blitzcrank",
    "Brand",
    "Braum",
    "Caitlyn",
    "Cassiopeia",
    "Chogath",
    "Corki",
    "Darius",
    "Diana",
    "Draven",
    "DrMundo",
    "Elise",
    "Evelynn",
    "Ezreal",
    "FiddleSticks",
    "Fiora",
    "Fizz",
    "Galio",
    "Gangplank",
    "Garen",
    "Gnar",
    "Gragas",
    "Graves",
    "Hecarim",
    "Heimerdinger",
    "Irelia",
    "Janna",
    "JarvanIV",
    "Jax",
    "Jayce",
    "Jinx",
    "Kalista",
    "Karma",
    "Karthus",
    "Kassadin",
    "Katarina",
    "Kayle",
    "Kennen",
    "Khazix",
    "KogMaw",
    "Leblanc",
    "LeeSin",
    "Leona",
    "Lissandra",
    "Lucian",
    "Lulu",
    "Lux",
    "Malphite",
    "Malzahar",
    "Maokai",
    "MasterYi",
    "MissFortune",
    "MonkeyKing",
    "Mordekaiser",
    "Morgana",
    "Nami",
    "Nasus",
    "Nautilus",
    "Nidalee",
    "Nocturne",
    "Nunu",
    "Olaf",
    "Orianna",
    "Pantheon",
    "Poppy",
    "Quinn",
    "Rammus",
    "Renekton",
    "Rengar",
    "Riven",
    "Rumble",
    "Sejuani",
    "Shaco",
    "Shen",
    "Shyvana",
    "Singed",
    "Sion",
    "Sivir",
    "Skarner",
    "Sona",
    "Soraka",
    "Swain",
    "Syndra",
    "Talon",
    "Taric",
    "Teemo",
    "Thresh",
    "Tristana",
    "Trundle",
    "TwistedFate",
    "Twitch",
    "Udyr",
    "Urgot",
    "Varus",
    "Vayne",
    "Veigar",
    "Velkoz",
    "Vi",
    "Viktor",
    "Vladimir",
    "Volibear",
    "Warwick",
    "Xerath",
    "XinZhao",
    "Yasuo",
    "Yorick",
    "Zac",
    "Zed",
    "Ziggs",
    "Zilean",
    "Zyra"
]