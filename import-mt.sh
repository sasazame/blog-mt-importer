#!/bin/bash

# Blog MT Importer Script
# Usage: ./import-mt.sh <mt-file.txt>

if [ $# -eq 0 ]; then
    echo "Blog MT Importer"
    echo "Usage: $0 <mt-file.txt>"
    echo ""
    echo "Example:"
    echo "  $0 /path/to/export.txt"
    exit 1
fi

MT_FILE="$1"

if [ ! -f "$MT_FILE" ]; then
    echo "Error: File '$MT_FILE' not found!"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found!"
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit .env file with your database configuration and run again."
    exit 1
fi

echo "Importing MT format file: $MT_FILE"
echo "======================================"

# Run the import command
npm run cli:dev import "$MT_FILE"