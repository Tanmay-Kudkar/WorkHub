package com.workhub.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.workhub.backend.entity.Employee;

@Service
public class AdminService {

  private final EmployeeService employeeService;

  public AdminService(EmployeeService employeeService) {
    this.employeeService = employeeService;
  }

  public List<Employee> listAll() {
    return employeeService.listAllRaw();
  }

  public Employee getById(Long id) {
    return employeeService.getRaw(id);
  }

  public void deleteById(Long id) {
    employeeService.delete(id);
  }
}
