FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY src ./src

# Build the application
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Set default environment variables (these should be overridden at runtime)
ENV DB_URL=jdbc:postgresql://localhost:5432/auth_db \
    DB_USERNAME=postgres \
    DB_PASSWORD=postgres \
    JWT_SECRET=PLACEHOLDER_SECRET_KEY_MUST_BE_SET_VIA_ENVIRONMENT_VARIABLE_MIN_256_BITS \
    JWT_EXPIRATION=86400000

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]