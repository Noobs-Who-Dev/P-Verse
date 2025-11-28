package com.app.pverse.exception;

public class MomentNotFoundException extends RuntimeException {
    public MomentNotFoundException(String message) {
        super(message);
    }

    public MomentNotFoundException(Long momentId) {
        super("Moment not found with id: " + momentId);
    }
}

