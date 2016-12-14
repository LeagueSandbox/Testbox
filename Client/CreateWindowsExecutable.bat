
cd /d %~dp0

cd ..

cd Binaries

cmd /k electron-packager %~dp0 LeagueUI --overwrite

PAUSE