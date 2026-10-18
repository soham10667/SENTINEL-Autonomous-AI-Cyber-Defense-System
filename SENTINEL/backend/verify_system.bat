@echo off
echo ========================================================
echo SENTINEL System & FalkorDB Verification
echo ========================================================
cd /d "%~dp0"

if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe verify_falkordb_integration.py
) else (
    python verify_falkordb_integration.py
)

pause
