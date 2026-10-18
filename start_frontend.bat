@echo off
echo ========================================================
echo Starting SENTINEL Defense Frontend (Port 3001)...
echo Note: Running on port 3001 to avoid FalkorDB Browser on 3000
echo ========================================================
cd /d "%~dp0SENTINEL\frontend"

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

echo Launching Next.js command center on port 3001...
call npm run dev
pause
