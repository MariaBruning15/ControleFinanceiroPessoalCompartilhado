package com.ifpr.backend.exception;

public class RecursoJaExisteException extends RuntimeException {
    public RecursoJaExisteException(String message) {
        super(message);
    }
}