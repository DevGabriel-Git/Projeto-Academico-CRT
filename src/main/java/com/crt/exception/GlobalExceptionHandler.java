package com.crt.exception;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ApiError> notFound(RecursoNaoEncontradoException ex) {
        return resposta(HttpStatus.NOT_FOUND, ex.getMessage());
    }
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> unauthorized(AuthenticationException ex) {
        return resposta(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
    }
    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class,
            ConstraintViolationException.class, org.springframework.http.converter.HttpMessageNotReadableException.class})
    public ResponseEntity<ApiError> invalid(Exception ex) {
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos para a operação");
    }
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<ApiError> missingEndpoint(Exception ex) {
        return resposta(HttpStatus.NOT_FOUND, "Recurso não encontrado");
    }
    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> concurrentUpdate(Exception ex) {
        return resposta(HttpStatus.CONFLICT, "Posição alterada; consulte o saldo e tente novamente");
    }
    @ExceptionHandler(org.springframework.web.client.RestClientException.class)
    public ResponseEntity<ApiError> upstream(Exception ex) {
        return resposta(HttpStatus.BAD_GATEWAY, "Serviço externo indisponível");
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> unexpected(Exception ex) {
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor");
    }
    private ResponseEntity<ApiError> resposta(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiError(status.value(), message));
    }
}
