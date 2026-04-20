@echo off
echo Starting Mirror App Servers...

echo Starting API Server on port 3000...
start "API Server" cmd /k "npm run api"

timeout /t 3 /nobreak >nul

echo Starting Frontend on port 5173...
start "Frontend" cmd /k "npm run dev"

echo Both servers starting...
echo API: http://localhost:3000
echo Frontend: http://localhost:5173
pause
