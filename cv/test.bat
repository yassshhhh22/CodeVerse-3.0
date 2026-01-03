@echo off
REM =============================================
REM Test System - CV Module
REM =============================================

echo.
echo ==========================================
echo   Testing CV Module Components
echo ==========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if activated
if "%VIRTUAL_ENV%"=="" (
    echo ERROR: Virtual environment not activated
    echo Please run setup_venv.bat first
    pause
    exit /b 1
)

echo Virtual environment: ACTIVE
echo.

REM Run test script
python test_system.py

pause
