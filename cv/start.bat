@echo off
REM =============================================
REM Quick Start - CV Module
REM =============================================

echo.
echo ==========================================
echo   Starting CV Module
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

REM Run main application
python main.py

pause
