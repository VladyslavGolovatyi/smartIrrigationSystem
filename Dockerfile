# ─── Stage 1: Build React frontend ───────────────────
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Build Spring Boot backend ─────────────
FROM maven:3.9.3-eclipse-temurin-17 AS backend-build
WORKDIR /app

# only need the pom for dependency resolution
COPY pom.xml ./

# fetch all dependencies
RUN mvn dependency:go-offline -B

# now copy the rest of your code & built frontend
COPY src src
COPY --from=frontend-build /app/frontend/build src/main/resources/static

# build the JAR
RUN mvn clean package -DskipTests

# ─── Stage 3: Runtime image ─────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
