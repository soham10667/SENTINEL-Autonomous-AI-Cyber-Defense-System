@echo off
echo ========================================================
echo Reconnecting & Verifying FalkorDB Container...
echo ========================================================
echo 1. Checking running Docker containers...
docker ps --filter "publish=6379"

echo.
echo 2. Starting or restarting FalkorDB container...
docker start falkordb 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Existing 'falkordb' container not found. Running new FalkorDB container...
    docker run -d --name falkordb -p 6379:6379 -p 3000:3000 falkordb/falkordb:latest
)

echo.
echo 3. Verifying FalkorDB connection on localhost:6379...
cd /d "%~dp0SENTINEL"
if exist "backend\venv\Scripts\python.exe" (
    backend\venv\Scripts\python.exe scripts\verify_falkordb.py
) else (
    python scripts\verify_falkordb.py
)

echo ========================================================
echo FalkorDB reconnection check complete.
echo If backend is running, click 'Reconnect FalkorDB' in Settings (http://localhost:3001/settings)
echo ========================================================
pause
