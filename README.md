# ParkingReservation System

Full-stack aplikacija sa servisom za autentifikaciju i mogućnosti za rezervaciju parking mesta

## Overview

Ovo je platforma za rezervaciju parkinga koja se bavi registracijom korisnika, prijavljivanjem i generisanjem JWT tokena. 
Sistem se sastoji od Spring Boot bekend servisa za autentifikaciju i Angular frontend aplikacije.

## Tehnologija

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
- **PostgreSQL** 
- **JWT** 
- **Maven**
- **Docker**

### Frontend
- **Angular 21**
- **TypeScript**
- **Reactive Forms**
- **CSS3**

## Funkcionalnosti

### Funkcionalnosti koje prve implementiram:
- Registracija korisnika sa validacijom
- Prijava korisnika sa generisanjem JWT tokena
- Heširanje lozinke
- Autentifikacija bez stanja korišćenjem JWT-a
- Responzivni Angular frontend
- Zaštićene rute sa zaštitom autentifikacije
- Automatsko upravljanje JWT tokenima
- Docker kontejnerizacija
- CI/CD tok rada sa GitHub akcijama

### Funkcionalnosti koje implementiram nakon gore navedenih:
- Pregled dostupnih parking mesta
- Rezerviši i upravljaj rezervacijama


## Struktura:

```
ParkingReservation/
├── src/                    # Backend 
│   └── main/
│       ├── java/          # Java source files
│       └── resources/     # Configuration & migrations
├── frontend/              # Angular frontend deo
│   ├── src/
│   │   ├── app/          # Angular components, services, guards
│   │   └── styles.css    # Global styles
│   └── package.json      # Frontend dependencies
├── pom.xml               # Backend Maven configuration
├── Dockerfile            # Backend Docker configuration
└── README.md            # Opis
```

## Neophodno

### Backend
- Java 17 +
- Maven 3.6+
- PostgreSQL 12+ (ili Docker)
- Docker ( za podizanje kontejnera)

### Frontend
- Node.js 18+ i npm
- Angular CLI 17+

## Variable za bazu podataka

## Moraju biti postavljene pre pokretanja baze

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/auth_db` | No |
| `DB_USERNAME` | Database username | `postgres` | No |
| `DB_PASSWORD` | Database password | `postgres` | No |
| `JWT_SECRET` | Secret key for JWT signing (min 256 bits) | - | **YES** |
| `JWT_EXPIRATION` | Token expiration in milliseconds | `86400000` (24h) | No |
| `SERVER_PORT` | Server port | `8080` | No |


## Startovanje

### Brzo pokretanje sa terminalskim skriptama (Preporučeno)

Najbrži način da pokrenete aplikaciju:

#### 1. Prvi put - instalacija zavisnosti

```bash
./setup.sh
```

Ova skripta će:
- Proveriti da li su Node.js i npm instalirani
- Instalirati sve npm zavisnosti za frontend
- Pripremiti aplikaciju za pokretanje

#### 2. Pokretanje aplikacije

```bash
./start.sh
```

Aplikacija će biti dostupna na: **http://localhost:4200**

Pritisnite `Ctrl+C` da zaustavite server.

#### 3. Alternativno - manuelno pokretanje

Možete takođe pokrenuti aplikaciju manuelno:

```bash
# Navigirajte do frontend direktorijuma
cd frontend/src

# Pokrenite development server
npm start
```

Aplikacija će biti dostupna na: **http://localhost:4200**

---

## Napomena: Autogenerisan ##

### Quick Start - Running Both Backend and Frontend

#### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb auth_db
```

#### 2. Configure Environment Variables

Set the required environment variables for the backend:

```bash
export JWT_SECRET="your-secure-secret-key-at-least-256-bits-long-here"
export DB_PASSWORD="your-database-password"
```

#### 3. Start the Backend

```bash
# Build the application
mvn clean package

# Run the application
java -jar target/auth-service-0.0.1-SNAPSHOT.jar
```

The backend will start on `http://localhost:8080`

#### 4. Start the Frontend

In a new terminal:

```bash
# Navigate to frontend directory
cd frontend/src

# Install dependencies (first time only)
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:4200`

#### 5. Access the Application

 `http://localhost:4200`

- **Register**: Kreiraj nalog na ruti `/register`
- **Login**: Prijavi se na ruti `/login`
- **Dashboard**: Informacije o prijavljenom profilu `/dashboard` 

### Using Docker for Backend

```bash
# Build the Docker image
docker build -t auth-service .

# Run the container
docker run -p 8080:8080 \
  -e JWT_SECRET="your-secure-secret-key-at-least-256-bits-long-here" \
  -e DB_URL="jdbc:postgresql://host.docker.internal:5432/auth_db" \
  -e DB_PASSWORD="your-database-password" \
  auth-service
```


### Frontend funkcionalnosti:
- Moderan UI 
- Form validacija sa error porukama
- upravljanje JWT tokenom  
- Zaštićene rute sa auth guardom
- API integracija sa bekendom



### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

## Development

### Running Tests

```bash
mvn test
```

## Security Considerations

### Backend
- Passwords are hashed using BCrypt
- JWT tokens are signed using HS256
- CSRF protection is disabled (stateless API with JWT)
- Environment variables are used for sensitive configuration
- Minimum JWT secret length is enforced (256 bits)

### Frontend
- JWT tokens stored in localStorage
- HTTP interceptor automatically adds Bearer token to requests
- Protected routes prevent unauthorized access
- Form validation prevents invalid data submission

### Important Notes
- **CORS**: The backend should be configured to allow requests from `http://localhost:4200` during development
- **Production**: Use HTTPS in production and update frontend API URL accordingly
- **Token Storage**: Consider using HttpOnly cookies in production for enhanced security

## Project Structure

```
src/
├── main/
│   ├── java/com/parkingshare/auth/
│   │   ├── config/          # Security configuration
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Data repositories
│   │   └── util/            # Utility classes (JWT)
│   └── resources/
│       ├── application.yml  # Application configuration
│       └── db/changelog/    # Liquibase migrations
└── test/                    # Test files

```


