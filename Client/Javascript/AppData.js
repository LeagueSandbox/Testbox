/**
 * Created by Matt on 12/12/2016.
 */

function AppData() {
    this.host = "";
    this.port = "";
    this.nickname = "";
    this.leaguePath = "";
}

AppData.prototype.getExecutablePath = function() {
    var isMac = process.platform === 'darwin';
    var isWindows = process.platform === 'win32';

    if (isWindows) {
        var leaguePath = this.leaguePath;
        if (leaguePath.substr(leaguePath.length - 1) != "\\") {
            leaguePath = leaguePath + "\\";
        }
        var garenaPath = leaguePath;
        leaguePath = leaguePath + "RADS/solutions/lol_game_client_sln/releases/0.0.1.68/deploy/";
        var leagueExecutable = leaguePath + "League of Legends.exe";
        var garenaExecutable = garenaPath + "League of Legends.exe";
        leagueExecutable = leagueExecutable.replaceAll('\\', '/');
        garenaExecutable = leagueExecutable.replaceAll('\\', '/');

        var fs = require('fs');
        if (!fs.existsSync(leagueExecutable)) {
            return leagueExecutable;
        }
        if (!fs.existsSync(garenaExecutable)) {
            return garenaExecutable;
        }
    }
    if (isMac) {
        var leaguePath = this.leaguePath;
        if (leaguePath.substr(leaguePath.length - 1) != "\\") {
            leaguePath = leaguePath + "\\";
        }
        leaguePath += "Contents/LoL/";
        var garenaPath = leaguePath;
        leaguePath = leaguePath + "RADS/projects/lol_game_client/releases/0.0.0.151/deploy/LeagueofLegends.app/Contents/MacOS/";
        var leagueExecutable = leaguePath + "League of Legends.exe";
        var garenaExecutable = garenaPath + "League of Legends.exe";
        leagueExecutable = leagueExecutable.replaceAll('\\', '/');
        garenaExecutable = leagueExecutable.replaceAll('\\', '/');

        var fs = require('fs');
        if (!fs.existsSync(leagueExecutable)) {
            return leagueExecutable;
        }
        if (!fs.existsSync(garenaExecutable)) {
            return garenaExecutable;
        }
    }
    return null;
};