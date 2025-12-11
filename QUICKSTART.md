# Quick Start Guide

This guide will help you set up and run the Parking Reservation Application from the terminal.

## Prerequisites

- Node.js 18+ and npm (already available in this environment)
- Terminal/Command Line access

## Setup & Run (2 steps)

### Step 1: Install Dependencies

Run the setup script to install all required dependencies:

```bash
./setup.sh
```

This script will:
- ✓ Check Node.js and npm installation
- ✓ Install all npm dependencies
- ✓ Prepare the application for launch

### Step 2: Start the Application

Run the start script to launch the development server:

```bash
./start.sh
```

The application will be available at: **http://localhost:4200**

Press `Ctrl+C` to stop the server.

## Alternative: Manual Setup

If you prefer to set up manually:

```bash
# Navigate to the frontend source directory
cd frontend/src

# Install dependencies (first time only)
npm install

# Start the development server
npm start
```

## Troubleshooting

### If you encounter any issues:

1. **Node.js not found**: Ensure Node.js 18+ is installed
2. **Permission denied**: Run `chmod +x setup.sh start.sh` to make scripts executable
3. **Port 4200 in use**: Stop any other process using port 4200 or specify a different port:
   ```bash
   cd frontend/src && ng serve --port 4300
   ```

## Features Available

Once the application is running, you can:

- **Register**: Create a new account at `/register`
- **Login**: Sign in at `/login`
- **Dashboard**: Access your dashboard at `/dashboard` (requires login)
- **Booking**: Reserve parking spots at `/booking` (requires login)
- **Owner**: Manage parking spots at `/owner` (requires login)

## Next Steps

For more detailed information, see the main [README.md](README.md) file.

For backend setup and integration, refer to the backend documentation (note: this is currently a frontend-only setup).
