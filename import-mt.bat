@echo off
REM Blog MT Importer Script
REM Usage: import-mt.bat <mt-file.txt>

if "%~1"=="" (
    echo Blog MT Importer
    echo Usage: %0 ^<mt-file.txt^>
    echo.
    echo Example:
    echo   %0 C:\path\to\export.txt
    exit /b 1
)

set MT_FILE=%~1

if not exist "%MT_FILE%" (
    echo Error: File '%MT_FILE%' not found!
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found!
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit .env file with your database configuration and run again.
    exit /b 1
)

echo Importing MT format file: %MT_FILE%
echo ======================================

REM Run the import command
npm run cli:dev import "%MT_FILE%"