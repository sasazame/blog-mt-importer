#!/bin/bash

# Blog MT Importer Server Script
# Usage: ./start-server.sh

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found!"
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your database configuration and run again."
    exit 1
fi

echo "Starting Blog MT Importer API Server..."
echo "======================================"

# Run the server
npm run start:dev