#!/bin/bash

# Parking Reservation App - Start Script
echo "=================================="
echo "Starting Parking Reservation App"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please run ./setup.sh first."
    exit 1
fi

# Navigate to frontend directory
cd frontend/src || { echo "❌ Frontend directory not found!"; exit 1; }

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Please run ./setup.sh first."
    exit 1
fi

echo "🚀 Starting the Angular development server..."
echo ""
echo "The application will be available at: http://localhost:4200"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""
echo "=================================="
echo ""

npm start
