FROM eclipse-temurin:17-jre-jammy

# Copia o jar gerado pelo Maven
COPY target/CorretoraAcademico-0.0.1-SNAPSHOT.jar /app.jar

EXPOSE 8080
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]