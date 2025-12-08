# Parking Reservation - Angular Frontend

This is the Angular frontend application for the Parking Reservation System. It provides a user interface for authentication (login and registration) and will include parking spot reservation features in the future.

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 21+
- The backend authentication service running on `http://localhost:8080`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Server

Run the development server:
```bash
npm start
```

or

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Build the project for production:
```bash
npm run build
```

or

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Features

### Current Features
- **User Registration**: New users can create an account with email, password, first name, last name, and optional phone number
- **User Login**: Registered users can log in with email and password
- **JWT Authentication**: Token-based authentication with automatic token management
- **Protected Routes**: Dashboard is protected and requires authentication
- **Responsive Design**: Mobile-friendly UI with modern styling

### Components

- **Login Component** (`/login`): User authentication form
- **Register Component** (`/register`): New user registration form
- **Dashboard Component** (`/dashboard`): Protected user dashboard (requires authentication)

### Services

- **AuthService**: Handles authentication operations (login, register, logout)
- **AuthGuard**: Route guard to protect authenticated routes
- **JwtInterceptor**: HTTP interceptor to automatically add JWT token to requests

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/              # Login component
│   │   │   ├── register/           # Registration component
│   │   │   └── dashboard/          # Dashboard component
│   │   ├── guards/
│   │   │   └── auth.guard.ts       # Authentication guard
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts  # JWT token interceptor
│   │   ├── models/
│   │   │   └── user.model.ts       # User-related interfaces
│   │   ├── services/
│   │   │   └── auth.service.ts     # Authentication service
│   │   ├── app-module.ts           # Main application module
│   │   ├── app-routing-module.ts   # Routing configuration
│   │   ├── app.ts                  # Root component
│   │   └── app.html                # Root template
│   ├── styles.css                  # Global styles
│   └── index.html                  # Main HTML file
├── angular.json                    # Angular CLI configuration
├── package.json                    # NPM dependencies
└── tsconfig.json                   # TypeScript configuration
```

## API Integration

The frontend communicates with the backend REST API:

- **Base URL**: `http://localhost:8080/api/auth`
- **Login Endpoint**: `POST /api/auth/login`
- **Register Endpoint**: `POST /api/auth/register`

## Development Notes

### Form Validation

All forms include comprehensive validation:
- Email format validation
- Password minimum length (8 characters)
- Required field validation
- Maximum length constraints

### State Management

- User authentication state is managed using RxJS BehaviorSubject
- JWT token and user data are stored in localStorage
- Automatic token injection in HTTP requests via interceptor

### Routing

- Default route redirects to login
- Dashboard is protected by AuthGuard
- Unknown routes redirect to login

## Future Enhancements

- Browse available parking spots
- Make and manage reservations
- Payment processing integration
- Location-based search
- Rating and reviews system
- User profile management
- Parking spot owner dashboard

## Testing

Run unit tests:
```bash
npm test
```

or

```bash
ng test
```

Run end-to-end tests:
```bash
ng e2e
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend is configured to allow requests from `http://localhost:4200`.

### Backend Connection
Make sure the backend authentication service is running on `http://localhost:8080` before starting the frontend.

### Port Conflicts
If port 4200 is already in use, you can specify a different port:
```bash
ng serve --port 4300
```

## Contributing

This is part of the Parking Reservation MVP project. Please follow Angular best practices and coding standards when contributing.
