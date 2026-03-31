package com.workhub.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.workhub.backend.entity.Employee;
import com.workhub.backend.repository.EmployeeLookupRepository;
import com.workhub.backend.repository.EmployeeRepository;

@Service
public class EmployeeService {

  private final EmployeeRepository employeeRepository;
  private final EmployeeLookupRepository employeeLookupRepository;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public EmployeeService(EmployeeRepository employeeRepository, EmployeeLookupRepository employeeLookupRepository) {
    this.employeeRepository = employeeRepository;
    this.employeeLookupRepository = employeeLookupRepository;
  }

  public List<Employee> list() {
    List<Employee> employees = employeeRepository.findAll();
    enrichEmployees(employees);
    return employees;
  }

  public Employee getById(Long id) {
    Employee employee = employeeRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Employee not found."));
    enrichEmployees(List.of(employee));
    return employee;
  }

  public Employee create(Employee employee) {
    if (employee.getPassword() != null && !employee.getPassword().isBlank()) {
      employee.setPasswordHash(passwordEncoder.encode(employee.getPassword()));
    } else if (employee.getPasswordHash() != null && !employee.getPasswordHash().isBlank()) {
      employee.setPasswordHash(passwordEncoder.encode(employee.getPasswordHash()));
    }

    if (employee.getRole() == null || employee.getRole().isEmpty()) {
      employee.setRole("USER");
    }

    Employee saved = employeeRepository.save(employee);
    enrichEmployees(List.of(saved));
    return saved;
  }

  public Employee update(Long id, Employee request) {
    Employee found = employeeRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Employee not found."));

    // Email must remain immutable after account creation.
    if (request.getEmail() != null
        && found.getEmail() != null
        && !request.getEmail().trim().equalsIgnoreCase(found.getEmail().trim())) {
      throw new IllegalArgumentException("Email cannot be changed after account creation.");
    }

    request.setId(found.getId());
    request.setEmail(found.getEmail());
    if (request.getPassword() != null && !request.getPassword().isBlank()) {
      request.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    } else {
      request.setPasswordHash(found.getPasswordHash());
    }
    if (request.getRole() == null || request.getRole().isEmpty()) {
      request.setRole(found.getRole());
    }

    // Preserve profile image when the client doesn't provide it.
    if (request.getProfileImage() == null || request.getProfileImage().isBlank()) {
      request.setProfileImage(found.getProfileImage());
    }

    Employee saved = employeeRepository.save(request);
    enrichEmployees(List.of(saved));
    return saved;
  }

  public void delete(Long id) {
    Employee found = employeeRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Employee not found."));
    employeeRepository.delete(found);
  }

  public List<Employee> listAllRaw() {
    return employeeRepository.findAll();
  }

  public Employee getRaw(Long id) {
    return employeeRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Employee not found."));
  }

  private void enrichEmployees(List<Employee> employees) {
    if (employees == null || employees.isEmpty()) {
      return;
    }

    Map<Long, String> departments = employeeLookupRepository.departmentsById();
    Map<Long, String> jobTitles = employeeLookupRepository.jobTitlesById();

    for (Employee employee : employees) {
      employee.setDepartmentName(departments.get(employee.getDepartmentId()));
      employee.setJobTitleName(jobTitles.get(employee.getJobTitleId()));
    }
  }

  public static boolean isDuplicateEmailException(DataIntegrityViolationException ex) {
    return ex != null && ex.getMessage() != null
        && ex.getMessage().contains("Duplicate entry")
        && ex.getMessage().contains("email");
  }
}
