@echo off
setlocal
pushd %~dp0
where node >nul 2>nul || (echo Node.js not found && pause && exit /b 1)
echo Running backup script...
node tools\backup-and-manifest.js
echo:
echo Done. Check the "backups" folder.
pause


