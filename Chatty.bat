@echo off
:: Chatty Application Launcher
setlocal enabledelayedexpansion

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

:: Set variables for venv name and backup venv name
set VENV_DIR=venv
set BACKUP_DIR=venv_old

:: Check if virtual environment exists
if exist %VENV_DIR% (
    echo Virtual environment already exists.
    
    set /P CHOICE="Do you want to create a fresh environment? (y/n): "
    echo.
    
    if /I "!CHOICE!"=="y" (
        echo Recreating virtual environment...
        
        :: Stop any Python processes that might be using the venv
        echo Stopping any Python processes...
        taskkill /f /im python.exe >nul 2>nul
        
        :: Wait for processes to terminate
        timeout /t 4 /nobreak >nul
        
        :: Rename existing venv to backup in case of issues with deletion
        echo Moving old environment to temporary location...
        if exist %BACKUP_DIR% (
            rmdir /s /q %BACKUP_DIR% >nul 2>nul
        )
        
        :: Try renaming instead of direct deletion (often more reliable)
        ren %VENV_DIR% %BACKUP_DIR% >nul 2>nul
        
        :: Verify the rename was successful
        if exist %VENV_DIR% (
            echo ERROR: Failed to rename existing environment.
            echo Please close any applications using the environment and try again.
            pause
            exit /b 1
        )
        
        :: Create new venv
        echo Creating fresh virtual environment...
        python -m venv %VENV_DIR%
        
        :: Verify venv creation
        if not exist %VENV_DIR% (
            echo ERROR: Failed to create new virtual environment.
            
            :: Try to recover old venv if available
            if exist %BACKUP_DIR% (
                echo Attempting to restore previous environment...
                ren %BACKUP_DIR% %VENV_DIR% >nul 2>nul
            )
            
            pause
            exit /b 1
        )
        
        :: Delete the backup venv if everything worked
        if exist %BACKUP_DIR% (
            echo Removing old environment backup...
            rmdir /s /q %BACKUP_DIR% >nul 2>nul
        )
        
        :: Install dependencies
        echo.
        echo Installing dependencies...
        call %VENV_DIR%\Scripts\activate.bat
        python -m pip install --upgrade pip
        
        :: Install specific versions that work together
        echo Installing compatible package versions...
        python -m pip install Werkzeug==2.0.3
        python -m pip install Flask==2.0.3
        python -m pip install Flask-WTF==1.0.1
        python -m pip install Flask-Session==0.4.0
        python -m pip install requests==2.31.0
        python -m pip install python-dotenv==1.0.0
        
        echo Environment setup complete.
    ) else (
        echo Using existing virtual environment.
        call %VENV_DIR%\Scripts\activate.bat
    )
) else (
    echo No existing virtual environment found.
    echo Creating new virtual environment...
    
    :: Create venv
    python -m venv %VENV_DIR%
    
    :: Verify venv creation
    if not exist %VENV_DIR% (
        echo ERROR: Failed to create virtual environment.
        pause
        exit /b 1
    )
    
    :: Install dependencies
    echo.
    echo Installing dependencies...
    call %VENV_DIR%\Scripts\activate.bat
    python -m pip install --upgrade pip
    
    :: Install specific versions that work together
    echo Installing compatible package versions...
    python -m pip install Werkzeug==2.0.3
    python -m pip install Flask==2.0.3
    python -m pip install Flask-WTF==1.0.1
    python -m pip install Flask-Session==0.4.0
    python -m pip install requests==2.31.0
    python -m pip install python-dotenv==1.0.0
    
    echo Environment setup complete.
)

:: Start the application
echo.
echo Starting Chatty web server...
echo When the server is ready, a browser window will open automatically.
echo Press Ctrl+C in the server window to stop the server when you're done.
echo.

:: Start the Flask server
start "Chatty Web Server" cmd /k "call %VENV_DIR%\Scripts\activate.bat && python app.py"

:: Wait a moment for the server to start
timeout /t 15 /nobreak >nul

:: Open the web browser
start http://127.0.0.1:5000

endlocal
exit /b 0
