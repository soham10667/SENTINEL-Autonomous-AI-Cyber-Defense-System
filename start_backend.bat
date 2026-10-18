@echo off
echo ========================================================
echo Starting SENTINEL Defense Backend (Port 8000)...
echo ========================================================
cd /d "%~dp0SENTINEL\backend"

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing dependencies...
pip install -r requirements.txt

echo Launching FastAPI Defense Server on port 8000...
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
