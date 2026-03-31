package com.workhub.backend.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workhub.backend.entity.Employee;
import com.workhub.backend.exception.ForbiddenException;
import com.workhub.backend.service.EmployeeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*") // allow deployed frontend
public class EmployeeController {

  private static final Logger log = LoggerFactory.getLogger(EmployeeController.class);

  private final EmployeeService employeeService;

  public EmployeeController(EmployeeService employeeService) {
    this.employeeService = employeeService;
  }

  @GetMapping
  public List<Employee> list(
      @RequestParam(required = false) Long requesterId,
      @RequestParam(required = false) String requesterRole) {
    if (isAdmin(requesterRole)) {
      return employeeService.list();
    }
    if (requesterId == null) {
      throw new IllegalArgumentException("Requester context is required.");
    }
    return List.of(employeeService.getById(requesterId));
  }

  @GetMapping("/{id}")
  public ResponseEntity<Employee> get(
      @PathVariable Long id,
      @RequestParam(required = false) Long requesterId,
      @RequestParam(required = false) String requesterRole) {
    try {
      enforceSelfOrAdmin(id, requesterId, requesterRole);
      return ResponseEntity.ok(employeeService.getById(id));
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.notFound().build();
    }
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestBody Employee employee) {
    try {
      return ResponseEntity.ok(employeeService.create(employee));
    } catch (DataIntegrityViolationException ex) {
      log.error("Data integrity violation when creating employee", ex);
      if (EmployeeService.isDuplicateEmailException(ex)) {
        return ResponseEntity.status(409).body(Map.of("error",
            "An account with this email already exists. Please use a different email or try logging in."));
      }
      return ResponseEntity.status(400).body(Map.of("error", "Invalid data provided. Please check your input."));
    } catch (Exception ex) {
      log.error("Unexpected error when creating employee", ex);
      return ResponseEntity.status(500).body(Map.of("error", "Internal server error. Please try again later."));
    }
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(
      @PathVariable Long id,
      @Valid @RequestBody Employee e,
      @RequestParam(required = false) Long requesterId,
      @RequestParam(required = false) String requesterRole) {
    try {
      enforceSelfOrAdmin(id, requesterId, requesterRole);
      return ResponseEntity.ok(employeeService.update(id, e));
    } catch (IllegalArgumentException ex) {
      String msg = ex.getMessage() == null ? "Invalid request." : ex.getMessage();
      if (msg.toLowerCase().contains("not found")) {
        return ResponseEntity.notFound().build();
      }
      return ResponseEntity.badRequest().body(Map.of("error", msg));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @PathVariable Long id,
      @RequestParam(required = false) String requesterRole) {
    if (!isAdmin(requesterRole)) {
      throw new ForbiddenException("Only admin can delete employees.");
    }
    try {
      employeeService.delete(id);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.notFound().build();
    }
  }

  private boolean isAdmin(String requesterRole) {
    return requesterRole != null && "ADMIN".equalsIgnoreCase(requesterRole.trim());
  }

  private void enforceSelfOrAdmin(Long targetEmployeeId, Long requesterId, String requesterRole) {
    if (isAdmin(requesterRole)) {
      return;
    }
    if (requesterId == null) {
      throw new IllegalArgumentException("Requester context is required.");
    }
    if (!targetEmployeeId.equals(requesterId)) {
      throw new ForbiddenException("Access denied for this employee profile.");
    }
  }
}
