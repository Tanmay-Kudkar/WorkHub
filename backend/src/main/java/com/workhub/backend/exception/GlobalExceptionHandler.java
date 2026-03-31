package com.workhub.backend.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
    return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
    return build(HttpStatus.CONFLICT, "Data integrity violation.", ex.getMostSpecificCause() != null
        ? ex.getMostSpecificCause().getMessage()
        : ex.getMessage());
  }

  @ExceptionHandler(DataAccessException.class)
  public ResponseEntity<Map<String, Object>> handleDataAccess(DataAccessException ex) {
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Database operation failed.",
        ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage());
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<Map<String, Object>> handleAccessDenied(ForbiddenException ex) {
    return build(HttpStatus.FORBIDDEN, ex.getMessage(), null);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
    return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error. Please try again later.", null);
  }

  private ResponseEntity<Map<String, Object>> build(HttpStatus status, String error, String details) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("error", error == null || error.isBlank() ? status.getReasonPhrase() : error);
    if (details != null && !details.isBlank()) {
      body.put("details", details);
    }
    return ResponseEntity.status(status).body(body);
  }
}
