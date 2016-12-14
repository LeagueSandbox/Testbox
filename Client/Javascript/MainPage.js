/**
 * Created by Matt on 12/12/2016.
 */

function MainPage(appLogic) {
    this.appLogic = appLogic;
    this.mainDiv = CreateElement({type: 'div', class: 'MainPage_MainDiv', elements: [
        this.chatBoxDiv = CreateElement({type: 'div', class: 'MainPage_ChatBoxDiv'}),
        this.chatBoxInput = CreateElement({type: 'input', class: 'MainPage_ChatBoxInput'}),
        this.onlineBoxDiv = CreateElement({type: 'div', class: 'MainPage_OnlineBoxDiv'}),
        this.championDiv = CreateElement({type: 'div', class: 'MainPage_ChampionDiv', elements:
        [
            CreateElement({type: 'div', class: 'MainPage_ChampionDivLabel', text: 'Champion: '}),
            this.championSelect = CreateElement({type: 'select', class: 'MainPage_ChampionSelect',
                onInput: CreateFunction(this, this.championSelectChange)})
        ]}),
        CreateElement({type: 'div', class: 'MainPage_LobbyContainer', elements: [
            (this.lobbyPage = new LobbyPage(this.appLogic)).getDiv()
        ]})
    ]});
    for (var i = 0; i < ChampionList.length; i++) {
        CreateElement({type: 'option', value: ChampionList[i], text: ChampionList[i], appendTo: this.championSelect});
    }
    this.championSelect.value = "Ezreal";
    this.chatBoxInput.placeholder = "Type text...";
    this.chatBoxInput.onkeydown = CreateFunction(this, this.chatInputKeyDown);

    this.blockingOverlay = CreateElement({type: 'div', class: 'MainPage_BlockOverlay', text: 'Game is Starting'})
}

MainPage.prototype.setBlockOverlayOn = function() {
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
            CreateElement({type: 'div', class: 'MainPage_OnlinePlayerNameDiv', text: 'Players Online: ' + this.appLogic.networkManager.onlinePlayers.length})
        ]})
    );
    for (var i = 0; i < this.appLogic.networkManager.onlinePlayers.length; i++) {
        var player = this.appLogic.networkManager.onlinePlayers[i];
        var playerDiv = CreateElement({type: 'div', class: 'MainPage_OnlinePlayerDiv', elements: [
            CreateElement({type: 'div', class: 'MainPage_OnlinePlayerIDDiv', text: player.id}),
            CreateElement({type: 'div', class: 'MainPage_OnlinePlayerChampionDiv', text: player.selectedChampion}),
            CreateElement({type: 'div', class: 'MainPage_OnlinePlayerNameDiv', text: player.nickname})
        ]});
        this.onlineBoxDiv.appendChild(playerDiv);
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
    "ChoGath",
    "Corki",
    "Darius",
    "Diana",
    "Draven",
    "DrMundo",
    "Elise",
    "Evelynn",
    "Ezreal",
    "Fiddlesticks",
    "Fiora",
    "Fizz",
    "Galio",
    "Gangplank",
    "Garen",
    "Global",
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
    "LeBlanc",
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