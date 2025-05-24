package com.fishook.fishook.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
        ApiErrorResponse apiErrorResponse = new ApiErrorResponse(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                "USER_ALREADY_EXISTS"
        );
        return new ResponseEntity<>(apiErrorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        ApiErrorResponse apiErrorResponse = new ApiErrorResponse(
                ex.getStatusCode().value(),
                ex.getReason(),
                "AUTHENTICATION_ERROR"
        );
        return new ResponseEntity<>(apiErrorResponse, ex.getStatusCode());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        ApiErrorResponse apiErrorResponse = new ApiErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Invalid email or password",
                "INVALID_CREDENTIALS"
        );
        return new ResponseEntity<>(apiErrorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        ApiErrorResponse apiErrorResponse = new ApiErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Authentication failed",
                "AUTHENTICATION_FAILED"
        );
        return new ResponseEntity<>(apiErrorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex) {
        ApiErrorResponse apiErrorResponse = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred. Please try again later.",
                "INTERNAL_SERVER_ERROR"
        );
        return new ResponseEntity<>(apiErrorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}