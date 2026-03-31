package com.workhub.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.workhub.backend.dto.AddressUpsertDto;
import com.workhub.backend.dto.LeaveDecisionDto;
import com.workhub.backend.dto.LeaveRequestCreateDto;
import com.workhub.backend.dto.PayrollCreateDto;
import com.workhub.backend.service.EmployeeReferenceService;

@RestController
@RequestMapping("/api/dbms")
@CrossOrigin(origins = "*")
public class EmployeeReferenceController {

  private final EmployeeReferenceService employeeReferenceService;

  public EmployeeReferenceController(EmployeeReferenceService employeeReferenceService) {
    this.employeeReferenceService = employeeReferenceService;
  }

  @GetMapping("/overview")
  public ResponseEntity<?> overview() {
    return ResponseEntity.ok(employeeReferenceService.overview());
  }

  @GetMapping("/table/{tableName}")
  public ResponseEntity<?> tableData(@PathVariable String tableName, @RequestParam(defaultValue = "10") int limit) {
    return ResponseEntity.ok(employeeReferenceService.tableData(tableName, limit));
  }

  @GetMapping("/leave-types")
  public ResponseEntity<?> leaveTypes() {
    return ResponseEntity.ok(employeeReferenceService.leaveTypes());
  }

  @GetMapping("/employees/{employeeId}/leave-requests")
  public ResponseEntity<?> listLeaveRequests(@PathVariable Long employeeId) {
    return ResponseEntity.ok(employeeReferenceService.listLeaveRequests(employeeId));
  }

  @PostMapping("/employees/{employeeId}/leave-requests")
  public ResponseEntity<?> createLeaveRequest(@PathVariable Long employeeId, @RequestBody LeaveRequestCreateDto request) {
    return ResponseEntity.ok(employeeReferenceService.createLeaveRequest(employeeId, request));
  }

  @GetMapping("/admin/leave-requests")
  public ResponseEntity<?> listLeaveRequestsForAdmin(
      @RequestParam Long adminId,
      @RequestParam(defaultValue = "PENDING") String status) {
    return ResponseEntity.ok(employeeReferenceService.listPendingLeaveRequests(adminId, status));
  }

  @GetMapping("/admin/employees/{employeeId}/leave-requests")
  public ResponseEntity<?> listLeaveRequestsForAdminEmployee(
      @PathVariable Long employeeId,
      @RequestParam Long adminId) {
    return ResponseEntity.ok(employeeReferenceService.listLeaveRequestsForAdminEmployee(adminId, employeeId));
  }

  @PostMapping("/admin/leave-requests/{leaveRequestId}/decision")
  public ResponseEntity<?> decideLeaveRequest(
      @PathVariable Long leaveRequestId,
      @RequestBody LeaveDecisionDto request) {
    return ResponseEntity.ok(employeeReferenceService.decideLeaveRequest(leaveRequestId, request));
  }

  @GetMapping("/admin/employees/{employeeId}/attendance")
  public ResponseEntity<?> listAttendanceForAdminEmployee(
      @PathVariable Long employeeId,
      @RequestParam Long adminId) {
    return ResponseEntity.ok(employeeReferenceService.listAttendanceForAdminEmployee(adminId, employeeId));
  }

  @GetMapping("/employees/{employeeId}/attendance/today")
  public ResponseEntity<?> todayAttendance(@PathVariable Long employeeId) {
    return ResponseEntity.ok(employeeReferenceService.todayAttendance(employeeId));
  }

  @PostMapping("/employees/{employeeId}/attendance/check-in")
  public ResponseEntity<?> checkIn(@PathVariable Long employeeId) {
    return ResponseEntity.ok(employeeReferenceService.checkIn(employeeId));
  }

  @PostMapping("/employees/{employeeId}/attendance/check-out")
  public ResponseEntity<?> checkOut(@PathVariable Long employeeId) {
    return ResponseEntity.ok(employeeReferenceService.checkOut(employeeId));
  }

  @GetMapping("/employees/{employeeId}/address")
  public ResponseEntity<?> getAddress(@PathVariable Long employeeId) {
    return ResponseEntity.ok(employeeReferenceService.getAddress(employeeId));
  }

  @PostMapping("/employees/{employeeId}/address")
  public ResponseEntity<?> upsertAddress(@PathVariable Long employeeId, @RequestBody AddressUpsertDto request) {
    return ResponseEntity.ok(employeeReferenceService.upsertAddress(employeeId, request));
  }

  @GetMapping("/employees/{employeeId}/payroll")
  public ResponseEntity<?> listPayroll(@PathVariable Long employeeId) {
    return ResponseEntity.ok(employeeReferenceService.listPayroll(employeeId));
  }

  @GetMapping("/admin/employees/{employeeId}/payroll")
  public ResponseEntity<?> listPayrollForAdminEmployee(
      @PathVariable Long employeeId,
      @RequestParam Long adminId) {
    return ResponseEntity.ok(employeeReferenceService.listPayrollForAdminEmployee(adminId, employeeId));
  }

  @PostMapping("/employees/{employeeId}/payroll")
  public ResponseEntity<?> createPayroll(@PathVariable Long employeeId, @RequestBody PayrollCreateDto request) {
    return ResponseEntity.ok(employeeReferenceService.createPayroll(employeeId, request));
  }
}
