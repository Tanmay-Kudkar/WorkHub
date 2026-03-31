package com.workhub.backend.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EmployeeReferenceRepository {

  private static final Map<String, String> TABLE_TITLES = Map.ofEntries(
      Map.entry("departments", "Departments"),
      Map.entry("job_titles", "Job Titles"),
      Map.entry("employees", "Employees"),
      Map.entry("employee_addresses", "Employee Addresses"),
      Map.entry("payroll", "Payroll"),
      Map.entry("attendance_records", "Attendance Records"),
      Map.entry("leave_types", "Leave Types"),
      Map.entry("leave_requests", "Leave Requests"));

  private static final Set<String> SENSITIVE_COLUMNS = Set.of(
      "password_hash",
      "password",
      "passwordHash");

  private final JdbcTemplate jdbcTemplate;

  public EmployeeReferenceRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public boolean supportsTable(String tableName) {
    return TABLE_TITLES.containsKey(tableName);
  }

  public String tableTitle(String tableName) {
    return TABLE_TITLES.get(tableName);
  }

  public List<Map<String, Object>> overviewTables() {
    List<Map<String, Object>> tables = new ArrayList<>();
    for (Map.Entry<String, String> table : TABLE_TITLES.entrySet()) {
      String tableName = table.getKey();
      Integer rowCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);

      Map<String, Object> item = new LinkedHashMap<>();
      item.put("tableName", tableName);
      item.put("title", table.getValue());
      item.put("rowCount", rowCount == null ? 0 : rowCount);
      tables.add(item);
    }
    return tables;
  }

  public int totalTables() {
    return TABLE_TITLES.size();
  }

  public List<Map<String, Object>> tableData(String tableName, int limit) {
    List<Map<String, Object>> rows = jdbcTemplate.queryForList(
        "SELECT * FROM " + tableName + " ORDER BY id LIMIT " + limit);
    sanitizeRows(rows);
    return rows;
  }

  public List<Map<String, Object>> leaveTypes() {
    return jdbcTemplate.queryForList(
        "SELECT id, leave_code AS \"leaveCode\", leave_name AS \"leaveName\", annual_quota_days AS \"annualQuotaDays\" "
            + "FROM leave_types ORDER BY id");
  }

  public boolean employeeExists(Long employeeId) {
    Integer count = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM employees WHERE id = ?",
        Integer.class,
        employeeId);
    return count != null && count > 0;
  }

  public boolean leaveTypeExists(Long leaveTypeId) {
    Integer count = jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM leave_types WHERE id = ?",
        Integer.class,
        leaveTypeId);
    return count != null && count > 0;
  }

  public String employeeRole(Long employeeId) {
    return jdbcTemplate.queryForObject(
        "SELECT \"role\" FROM employees WHERE id = ?",
        String.class,
        employeeId);
  }

  public List<Map<String, Object>> listLeaveRequests(Long employeeId) {
    return jdbcTemplate.queryForList(
      "SELECT lr.id, lr.start_date AS \"startDate\", lr.end_date AS \"endDate\", lr.reason, "
        + "lr.approval_status AS \"approvalStatus\", lr.applied_on AS \"appliedOn\", lr.approved_on AS \"approvedOn\", "
        + "lr.approved_by AS \"approvedBy\", (ap.first_name || ' ' || ap.last_name) AS \"approvedByName\", "
        + "lt.leave_name AS \"leaveType\" "
            + "FROM leave_requests lr "
            + "JOIN leave_types lt ON lt.id = lr.leave_type_id "
            + "LEFT JOIN employees ap ON ap.id = lr.approved_by "
            + "WHERE lr.employee_id = ? "
            + "ORDER BY lr.applied_on DESC",
        employeeId);
  }

  public List<Map<String, Object>> listLeaveRequestsForAdmin(String status) {
    if (status == null || status.isBlank()) {
      status = "PENDING";
    }
    return jdbcTemplate.queryForList(
        "SELECT lr.id, lr.employee_id AS \"employeeId\", "
            + "(e.first_name || ' ' || e.last_name) AS \"employeeName\", "
            + "lr.start_date AS \"startDate\", lr.end_date AS \"endDate\", lr.reason, "
            + "lr.approval_status AS \"approvalStatus\", lr.applied_on AS \"appliedOn\", lr.approved_on AS \"approvedOn\", "
            + "lr.approved_by AS \"approvedBy\", (ap.first_name || ' ' || ap.last_name) AS \"approvedByName\", "
            + "lt.leave_name AS \"leaveType\" "
            + "FROM leave_requests lr "
            + "JOIN employees e ON e.id = lr.employee_id "
            + "JOIN leave_types lt ON lt.id = lr.leave_type_id "
            + "LEFT JOIN employees ap ON ap.id = lr.approved_by "
            + "WHERE lr.approval_status = ? "
            + "ORDER BY lr.applied_on DESC",
        status);
  }

  public int decideLeaveRequest(Long leaveRequestId, String newStatus, Long approverId) {
    return jdbcTemplate.update(
        "UPDATE leave_requests "
            + "SET approval_status = ?, approved_on = NOW(), approved_by = ? "
            + "WHERE id = ? AND approval_status = 'PENDING'",
        newStatus,
        approverId,
        leaveRequestId);
  }

  public void createLeaveRequest(Long employeeId, Long leaveTypeId, LocalDate start, LocalDate end, String reason) {
    jdbcTemplate.update(
        "INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason, approval_status) "
            + "VALUES (?, ?, ?, ?, ?, 'PENDING')",
        employeeId,
        leaveTypeId,
        start,
        end,
        reason);
  }

  public Map<String, Object> loadTodayAttendance(Long employeeId) {
    List<Map<String, Object>> rows = jdbcTemplate.queryForList(
      "SELECT id, attendance_date AS \"attendanceDate\", check_in_time AS \"checkInTime\", "
        + "check_out_time AS \"checkOutTime\", attendance_status AS \"attendanceStatus\" "
            + "FROM attendance_records WHERE employee_id = ? AND attendance_date = CURRENT_DATE",
        employeeId);

    if (rows.isEmpty()) {
      Map<String, Object> notMarked = new LinkedHashMap<>();
      notMarked.put("attendanceDate", LocalDate.now().toString());
      notMarked.put("checkInTime", null);
      notMarked.put("checkOutTime", null);
      notMarked.put("attendanceStatus", "NOT_MARKED");
      return notMarked;
    }
    return rows.get(0);
  }

  public void checkIn(Long employeeId) {
    jdbcTemplate.update(
        "INSERT INTO attendance_records (employee_id, attendance_date, check_in_time, attendance_status) "
            + "VALUES (?, CURRENT_DATE, NOW(), 'PRESENT') "
            + "ON CONFLICT (employee_id, attendance_date) "
            + "DO UPDATE SET check_in_time = COALESCE(attendance_records.check_in_time, EXCLUDED.check_in_time), "
            + "attendance_status = 'PRESENT'",
        employeeId);
  }

  public int checkOut(Long employeeId) {
    return jdbcTemplate.update(
        "UPDATE attendance_records "
            + "SET check_out_time = NOW(), attendance_status = 'PRESENT' "
            + "WHERE employee_id = ? AND attendance_date = CURRENT_DATE",
        employeeId);
  }

  public List<Map<String, Object>> listAttendance(Long employeeId) {
    return jdbcTemplate.queryForList(
      "SELECT id, attendance_date AS \"attendanceDate\", check_in_time AS \"checkInTime\", "
        + "check_out_time AS \"checkOutTime\", attendance_status AS \"attendanceStatus\" "
        + "FROM attendance_records WHERE employee_id = ? "
        + "ORDER BY attendance_date DESC, id DESC",
        employeeId);
  }

  public Map<String, Object> getAddress(Long employeeId) {
    List<Map<String, Object>> rows = jdbcTemplate.queryForList(
      "SELECT id, employee_id AS \"employeeId\", address_line AS \"addressLine\", city, state, pincode "
            + "FROM employee_addresses WHERE employee_id = ?",
        employeeId);

    if (rows.isEmpty()) {
      return Map.of(
          "employeeId", employeeId,
          "addressLine", "",
          "city", "",
          "state", "",
          "pincode", "");
    }
    return rows.get(0);
  }

  public void upsertAddress(Long employeeId, String addressLine, String city, String state, String pincode) {
    jdbcTemplate.update(
        "INSERT INTO employee_addresses (employee_id, address_line, city, state, pincode) "
            + "VALUES (?, ?, ?, ?, ?) "
            + "ON CONFLICT (employee_id) DO UPDATE SET "
            + "address_line = EXCLUDED.address_line, city = EXCLUDED.city, state = EXCLUDED.state, pincode = EXCLUDED.pincode",
        employeeId,
        addressLine,
        city,
        state,
        pincode);
  }

  public List<Map<String, Object>> listPayroll(Long employeeId) {
    return jdbcTemplate.queryForList(
      "SELECT id, employee_id AS \"employeeId\", salary, bonus, deductions, pay_date AS \"payDate\" "
            + "FROM payroll WHERE employee_id = ? "
            + "ORDER BY pay_date DESC, id DESC",
        employeeId);
  }

  public Map<String, Object> createPayroll(Long employeeId, BigDecimal salary, BigDecimal bonus, BigDecimal deductions,
      LocalDate payDate) {
    return jdbcTemplate.queryForMap(
        "INSERT INTO payroll (employee_id, salary, bonus, deductions, pay_date) "
            + "VALUES (?, ?, ?, ?, ?) "
        + "RETURNING id, employee_id AS \"employeeId\", salary, bonus, deductions, pay_date AS \"payDate\"",
        employeeId,
        salary,
        bonus,
        deductions,
        payDate);
  }

  private void sanitizeRows(List<Map<String, Object>> rows) {
    if (rows == null || rows.isEmpty()) {
      return;
    }

    for (Map<String, Object> row : rows) {
      if (row == null || row.isEmpty()) {
        continue;
      }
      row.keySet().removeIf(SENSITIVE_COLUMNS::contains);
    }
  }
}
