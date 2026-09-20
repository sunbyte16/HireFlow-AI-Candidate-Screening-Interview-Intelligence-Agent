@echo off
echo ========================================================
echo Launching HireFlow AI (Backend + Frontend)...
echo ========================================================
start "HireFlow AI Backend" cmd /k "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "HireFlow AI Frontend" cmd /k "%~dp0start_frontend.bat"
echo.
echo ========================================================
echo HireFlow AI is starting!
echo Backend:  http://127.0.0.1:8000/api/health
echo Frontend: http://localhost:5173
echo ========================================================
