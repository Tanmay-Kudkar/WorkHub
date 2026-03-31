package com.workhub.backend.service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.workhub.backend.dto.AddressUpsertDto;
import com.workhub.backend.dto.LeaveDecisionDto;
import com.workhub.backend.dto.LeaveRequestCreateDto;
import com.workhub.backend.dto.PayrollCreateDto;
import com.workhub.backend.repository.EmployeeReferenceRepository;

@Service
public class EmployeeReferenceService {

  private final EmployeeReferenceRepository employeeReferenceRepository;

  public EmployeeReferenceService(EmployeeReferenceRepository employeeReferenceRepository) {
    this.employeeReferenceRepository = employeeReferenceRepository;
  }

  public Map<String, Object> overview() {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("totalTables", employeeReferenceRepository.totalTables());
    response.put("tables", employeeReferenceRepository.overviewTables());
    return response;
  }

  public Map<String, Object> tableData(String tableName, int limit) {
    if (!employeeReferenceRepository.supportsTable(tableName)) {
      throw new IllegalArgumentException("Unknown employee reference table requested.");
    }

    int safeLimit = Math.max(1, Math.min(limit, 50));

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("tableName", tableName);
    response.put("title", employeeReferenceRepository.tableTitle(tableName));
    response.put("limit", safeLimit);
    response.put("rows", employeeReferenceRepository.tableData(tableName, safeLimit));
    return response;
  }

  public List<Map<String, Object>> leaveTypes() {
    return employeeReferenceRepository.leaveTypes();
  }

  public List<Map<String, Object>> listLeaveRequests(Long employeeId) {
    requireEmployee(employeeId);
    return employeeReferenceRepository.listLeaveRequests(employeeId);
  }

  public Map<String, Object> createLeaveRequest(Long employeeId, LeaveRequestCreateDto request) {
    requireEmployee(employeeId);

    if (request == null || request.leaveTypeId() == null || request.startDate() == null || request.endDate() == null) {
      throw new IllegalArgumentException("Leave type, start date, and end date are required.");
    }

    if (request.reason() == null || request.reason().isBlank()) {
      throw new IllegalArgumentException("Reason is required.");
    }

    LocalDate start;
    LocalDate end;
    try {
      start = LocalDate.parse(request.startDate());
      end = LocalDate.parse(request.endDate());
    } catch (Exception ex) {
      throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD.");
    }

    if (end.isBefore(start)) {
      throw new IllegalArgumentException("To date must be the same as or after From date.");
    }

    if (!employeeReferenceRepository.leaveTypeExists(request.leaveTypeId())) {
      throw new IllegalArgumentException("Invalid leave type selected.");
    }

    employeeReferenceRepository.createLeaveRequest(employeeId, request.leaveTypeId(), start, end, request.reason());
    return Map.of("message", "Leave request submitted successfully.");
  }

  public List<Map<String, Object>> listPendingLeaveRequests(Long adminId, String status) {
    requireAdmin(adminId);
    String normalized = normalizeDecisionStatus(status);
    return employeeReferenceRepository.listLeaveRequestsForAdmin(normalized);
  }

  public List<Map<String, Object>> listLeaveRequestsForAdminEmployee(Long adminId, Long employeeId) {
    requireAdmin(adminId);
    requireEmployee(employeeId);
    return employeeReferenceRepository.listLeaveRequests(employeeId);
  }

  public Map<String, Object> decideLeaveRequest(Long leaveRequestId, LeaveDecisionDto request) {
    if (leaveRequestId == null || leaveRequestId <= 0) {
      throw new IllegalArgumentException("Invalid leave request id.");
    }
    if (request == null || request.adminId() == null) {
      throw new IllegalArgumentException("Admin id is required.");
    }
    requireAdmin(request.adminId());

    String decision = normalizeDecisionStatus(request.decision());
    if (!"APPROVED".equals(decision) && !"REJECTED".equals(decision)) {
      throw new IllegalArgumentException("Decision must be APPROVED or REJECTED.");
    }

    int updated = employeeReferenceRepository.decideLeaveRequest(leaveRequestId, decision, request.adminId());
    if (updated == 0) {
      throw new IllegalArgumentException("Leave request already processed or not found.");
    }
    return Map.of("message", "Leave request " + decision.toLowerCase() + ".");
  }

  public Map<String, Object> todayAttendance(Long employeeId) {
    requireEmployee(employeeId);
    return employeeReferenceRepository.loadTodayAttendance(employeeId);
  }

  public Map<String, Object> checkIn(Long employeeId) {
    requireEmployee(employeeId);
    employeeReferenceRepository.checkIn(employeeId);
    return employeeReferenceRepository.loadTodayAttendance(employeeId);
  }

  public Map<String, Object> checkOut(Long employeeId) {
    requireEmployee(employeeId);
    int updated = employeeReferenceRepository.checkOut(employeeId);

    if (updated == 0) {
      throw new IllegalArgumentException("Please check in before checking out.");
    }

    return employeeReferenceRepository.loadTodayAttendance(employeeId);
  }

  public List<Map<String, Object>> listAttendanceForAdminEmployee(Long adminId, Long employeeId) {
    requireAdmin(adminId);
    requireEmployee(employeeId);
    return employeeReferenceRepository.listAttendance(employeeId);
  }

  public Map<String, Object> getAddress(Long employeeId) {
    requireEmployee(employeeId);
    return employeeReferenceRepository.getAddress(employeeId);
  }

  public Map<String, Object> upsertAddress(Long employeeId, AddressUpsertDto request) {
    requireEmployee(employeeId);

    if (request == null) {
      throw new IllegalArgumentException("Address payload is required.");
    }

    employeeReferenceRepository.upsertAddress(
        employeeId,
        request.addressLine(),
        request.city(),
        request.state(),
        request.pincode());

    return employeeReferenceRepository.getAddress(employeeId);
  }

  public List<Map<String, Object>> listPayroll(Long employeeId) {
    requireEmployee(employeeId);
    return employeeReferenceRepository.listPayroll(employeeId);
  }

  public List<Map<String, Object>> listPayrollForAdminEmployee(Long adminId, Long employeeId) {
    requireAdmin(adminId);
    requireEmployee(employeeId);
    return employeeReferenceRepository.listPayroll(employeeId);
  }

  public Map<String, Object> createPayroll(Long employeeId, PayrollCreateDto request) {
    requireEmployee(employeeId);

    if (request == null || request.payDate() == null || request.payDate().isBlank()) {
      throw new IllegalArgumentException("Pay date is required.");
    }

    LocalDate payDate;
    try {
      payDate = LocalDate.parse(request.payDate());
    } catch (Exception ex) {
      throw new IllegalArgumentException("Invalid pay date format. Use YYYY-MM-DD.");
    }

    return employeeReferenceRepository.createPayroll(
        employeeId,
        request.salary(),
        request.bonus(),
        request.deductions(),
        payDate);
  }

  private void requireEmployee(Long employeeId) {
    if (!employeeReferenceRepository.employeeExists(employeeId)) {
      throw new IllegalArgumentException("Employee not found.");
    }
  }

  private void requireAdmin(Long employeeId) {
    requireEmployee(employeeId);
    String role = employeeReferenceRepository.employeeRole(employeeId);
    if (role == null || !"ADMIN".equalsIgnoreCase(role)) {
      throw new IllegalArgumentException("Admin access required.");
    }
  }

  private String normalizeDecisionStatus(String status) {
    if (status == null) return "PENDING";
    String trimmed = status.trim();
    if (trimmed.isEmpty()) return "PENDING";
    return trimmed.toUpperCase();
  }
}
