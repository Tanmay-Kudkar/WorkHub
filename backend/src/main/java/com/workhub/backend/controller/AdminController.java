package com.workhub.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workhub.backend.entity.Employee;
import com.workhub.backend.service.AdminService;

@RestController
@RequestMapping("/api/admin/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  // Admin can list all employees
  @GetMapping
  public List<Employee> listAll() {
    return adminService.listAll();
  }

  // Admin can view any employee
  @GetMapping("/{id}")
  public ResponseEntity<Employee> get(@PathVariable Long id) {
    try {
      return ResponseEntity.ok(adminService.getById(id));
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.notFound().build();
    }
  }

  // Admin can delete any employee
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    try {
      adminService.deleteById(id);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.notFound().build();
    }
  }
}
