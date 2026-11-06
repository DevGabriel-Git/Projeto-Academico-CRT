package com.crt.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<org.springframework.http.ProblemDetail> notFound(
            RecursoNaoEncontradoException ex) {
        return resposta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<org.springframework.http.ProblemDetail> unauthorized() {
        return resposta(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
    }

    @ExceptionHandler({
        IllegalArgumentException.class,
        MethodArgumentNotValidException.class,
        ConstraintViolationException.class,
        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
        org.springframework.http.converter.HttpMessageNotReadableException.class
    })
    public ResponseEntity<org.springframework.http.ProblemDetail> invalid() {
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos para a operação");
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<org.springframework.http.ProblemDetail> missingEndpoint() {
        return resposta(HttpStatus.NOT_FOUND, "Recurso não encontrado");
    }

    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<org.springframework.http.ProblemDetail> concurrentUpdate() {
        return resposta(
                HttpStatus.CONFLICT, "Posição alterada; consulte o saldo e tente novamente");
    }

    @ExceptionHandler(org.springframework.web.client.RestClientException.class)
    public ResponseEntity<org.springframework.http.ProblemDetail> upstream() {
        return resposta(HttpStatus.BAD_GATEWAY, "Serviço externo indisponível");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<org.springframework.http.ProblemDetail> unexpected() {
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor");
    }

    private ResponseEntity<org.springframework.http.ProblemDetail> resposta(
            HttpStatus status, String message) {
        var problem = org.springframework.http.ProblemDetail.forStatusAndDetail(status, message);
        // Preserve the existing Angular error field while adopting RFC 9457.
        problem.setProperty("message", message);
        return ResponseEntity.status(status).body(problem);
    }
}
