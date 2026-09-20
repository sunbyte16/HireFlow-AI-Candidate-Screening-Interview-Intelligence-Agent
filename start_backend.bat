@echo off
echo ========================================================
echo Starting HireFlow AI Backend (FastAPI on Port 8000)...
echo ========================================================
cd /d "%~dp0backend"
if exist .venv\Scripts\python.exe (
    echo Using virtual environment at backend\.venv...
    ".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
) else (
    echo Using system Python...
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
)
