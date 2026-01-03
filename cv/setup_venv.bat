@echo off
REM =============================================
REM Virtual Environment Setup Script
REM =============================================
echo.
echo ==========================================
echo   CV Module - Virtual Environment Setup
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

REM Create virtual environment
echo [1/4] Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)
echo      Done!

REM Activate virtual environment
echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat
echo      Done!

REM Upgrade pip
echo [3/4] Upgrading pip...
python -m pip install --upgrade pip
echo      Done!

REM Install dependencies
echo [4/4] Installing dependencies (this may take a few minutes)...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo      Done!

echo.
echo ==========================================
echo   Setup Complete!
echo ==========================================
echo.
echo To activate the virtual environment:
echo    venv\Scripts\activate
echo.
echo To run the system:
echo    python main.py
echo.
echo To test components:
echo    python test_system.py
echo.
pause
