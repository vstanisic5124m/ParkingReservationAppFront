#!/bin/bash

# Parking Reservation App - Setup Script
echo "=================================="
echo "Parking Reservation App Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm to continue."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ npm version: $(npm --version)"
echo ""

# Navigate to frontend directory
cd frontend/src || { echo "❌ Frontend directory not found!"; exit 1; }

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "✓ Setup completed successfully!"
    echo "=================================="
    echo ""
    echo "To start the application, run:"
    echo "  ./start.sh"
    echo ""
    echo "Or manually:"
    echo "  cd frontend/src && npm start"
    echo ""
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    exit 1
fi
