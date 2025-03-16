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

:: Check if virtual environment exists
if exist venv (
    echo Virtual environment already exists.
    choice /C YN /M "Do you want to create a fresh environment (Y) or use the existing one (N)?"
    if %ERRORLEVEL% equ 1 (
        echo Removing existing virtual environment...
        rd /s /q venv 2>nul
        :: If removal fails, try closing any processes that might be using it
        if exist venv (
            echo Please close any other Python or Chatty windows and try again.
            echo Press any key to exit...
            pause >nul
            exit /b 1
        )
        goto :create_env
    ) else (
        echo Using existing virtual environment.
        goto :activate_env
    )
) else (
    goto :create_env
)

:create_env
:: Create a new virtual environment
echo Setting up a virtual environment...
python -m venv venv
if %ERRORLEVEL% neq 0 (
    echo Failed to create virtual environment.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Install dependencies in the correct order
echo Installing dependencies with specific versions...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install Werkzeug==2.0.3
pip install Flask==2.0.3
pip install Flask-WTF==1.0.1
pip install Flask-Session==0.4.0
pip install requests==2.31.0
pip install python-dotenv==1.0.0
goto :start_app

:activate_env
:: Activate existing virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

:start_app
:: Start the application
echo.
echo Starting Chatty web server...
echo When the server is ready, a browser window will open automatically.
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.

:: Start the Flask server
start "Chatty Web Server" cmd /k "call venv\Scripts\activate.bat && python app.py"

:: Wait a moment for the server to start
timeout /t 15 /nobreak >nul

:: Open the web browser
start http://127.0.0.1:5000

exit /b 0
