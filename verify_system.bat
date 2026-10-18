@echo off
echo ========================================================
echo SENTINEL System & FalkorDB Verification
echo ========================================================
cd /d "%~dp0SENTINEL"

if exist "backend\venv\Scripts\python.exe" (
    backend\venv\Scripts\python.exe backend\verify_falkordb_integration.py
) else (
    python backend\verify_falkordb_integration.py
)

pause
