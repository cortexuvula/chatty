@echo off
:: Chatty Application Launcher
echo Starting Chatty... Please wait.
echo.

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/downloads/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Check if virtual environment exists, if not create one
if not exist venv (
    echo Setting up virtual environment...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo Failed to create virtual environment.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

:: Activate virtual environment and install dependencies if needed
echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Check if requirements are installed
pip list | findstr Flask >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing dependencies...
    pip install -r requirements.txt
    if %ERRORLEVEL% neq 0 (
        echo Failed to install dependencies.
        echo Press any key to exit...
        pause >nul
        exit /b 1
    )
)

:: Start the application
echo.
echo Starting Chatty web server...
echo When the server is ready, a browser window will open automatically.
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.

:: Start the Flask server
start "Chatty Web Server" /min cmd /c "python app.py"

:: Wait a moment for the server to start
timeout /t 3 /nobreak >nul

:: Open the web browser
start http://127.0.0.1:5000

exit /b 0
