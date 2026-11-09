FROM maven:3.9.14-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src src
COPY quality quality
# Existing Windows checkouts may still contain CRLF despite .gitattributes.
# Normalize line endings only; formatting and quality checks remain mandatory.
RUN find src -type f -name '*.java' -exec sed -i 's/\r$//' {} + \
    && mvn -B -ntp -DskipTests package
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN groupadd --system app && useradd --system --gid app app && mkdir /app/data && chown app:app /app/data
COPY --from=build --chown=app:app /build/target/CorretoraAcademico-0.0.1-SNAPSHOT.jar app.jar
USER app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
