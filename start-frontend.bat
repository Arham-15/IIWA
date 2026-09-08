@echo off
cd /d "%~dp0frontend"
echo Starting AttendanceSafe Frontend on http://localhost:5173 ...
npm.cmd run dev
pause
