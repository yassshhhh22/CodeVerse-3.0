@echo off
REM =============================================
REM Visual Camera Test
REM =============================================

echo.
echo ==========================================
echo   Visual Camera Test
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

REM Run visual test
python visual_test.py

pause
