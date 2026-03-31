const API_BASE = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
const base = `${API_BASE}/api/employees`;
const adminBase = `${API_BASE}/api/admin/employees`;

function buildRequesterQuery(currentUser) {
  const params = new URLSearchParams();
  if (currentUser?.id != null) params.set("requesterId", String(currentUser.id));
  if (currentUser?.role) params.set("requesterRole", String(currentUser.role));
  const q = params.toString();
  return q ? `?${q}` : "";
}

export async function listEmployees(currentUser) {
  const res = await fetch(`${base}${buildRequesterQuery(currentUser)}`);
  if (!res.ok) throw new Error("Failed to load employees");
  return res.json();
}

export async function createEmployee(emp) {
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emp),
  });

  if (!res.ok) {
    let msg = "Registration failed";
    try {
      const data = await res.json();
      if (data?.error) {
        msg = data.error;
      } else if (
        res.status === 409 ||
        (data?.message && data.message.includes("Duplicate entry"))
      ) {
        msg = "Email already exists. Please use a different email address.";
      } else if (data?.message && data.message.includes("email")) {
        msg = "Email already exists. Please use a different email address.";
      }
    } catch (_) {
      // If response is not JSON, check status codes
      if (res.status === 409) {
        msg = "Email already exists. Please use a different email address.";
      } else if (res.status === 400) {
        msg = "Invalid registration data. Please check your input.";
      }
    }
    throw new Error(msg);
  }

  return res.json();
}

export async function updateEmployee(id, emp, currentUser) {
  const res = await fetch(`${base}/${id}${buildRequesterQuery(currentUser)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emp),
  });
  if (!res.ok) {
    let msg = "Update failed";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
      else if (data?.message) msg = data.message;
    } catch (_) {
      // ignore
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteEmployee(id, currentUser) {
  const res = await fetch(`${base}/${id}${buildRequesterQuery(currentUser)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let msg = "Login failed";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch (_) {
      // ignore parse error, keep default message
    }
    if (res.status === 404 || res.status === 401) {
      throw new Error(msg);
    }
    throw new Error(msg);
  }

  return res.json();
}

export function getGoogleAuthStartUrl(mode = "login") {
  const normalizedMode = mode === "register" ? "register" : "login";
  return `${API_BASE}/api/auth/google/start?mode=${encodeURIComponent(
    normalizedMode
  )}`;
}

export async function exchangeGoogleAuthToken(token) {
  const res = await fetch(
    `${API_BASE}/api/auth/google/exchange?token=${encodeURIComponent(token)}`
  );

  if (!res.ok) {
    let msg = "Google sign-in failed";
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch (_) {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json();
}

// Admin functions
export async function adminListEmployees() {
  const res = await fetch(adminBase);
  if (!res.ok) throw new Error("Failed to load employees");
  return res.json();
}

export async function adminDeleteEmployee(id) {
  const res = await fetch(`${adminBase}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

export async function listDepartments() {
  const res = await fetch(`${API_BASE}/api/departments`);
  if (!res.ok) throw new Error("Failed to load departments");
  return res.json();
}

export async function listJobTitles() {
  const res = await fetch(`${API_BASE}/api/job-titles`);
  if (!res.ok) throw new Error("Failed to load job titles");
  return res.json();
}

export async function fetchEmployeeAddress(employeeId) {
  const res = await fetch(`${API_BASE}/api/dbms/employees/${employeeId}/address`);
  if (!res.ok) throw new Error("Failed to load employee address");
  return res.json();
}

export async function upsertEmployeeAddress(employeeId, payload) {
  const res = await fetch(`${API_BASE}/api/dbms/employees/${employeeId}/address`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save employee address");
  return res.json();
}

export async function fetchEmployeePayroll(employeeId) {
  const res = await fetch(`${API_BASE}/api/dbms/employees/${employeeId}/payroll`);
  if (!res.ok) throw new Error("Failed to load employee payroll");
  return res.json();
}

export async function createEmployeePayroll(employeeId, payload) {
  const res = await fetch(`${API_BASE}/api/dbms/employees/${employeeId}/payroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create payroll entry");
  return res.json();
}

export async function fetchReferenceOverview() {
  const res = await fetch(`${API_BASE}/api/dbms/overview`);
  if (!res.ok) throw new Error("Failed to load employee reference overview");
  return res.json();
}

export async function fetchReferenceTableData(tableName, limit = 10) {
  const res = await fetch(
    `${API_BASE}/api/dbms/table/${encodeURIComponent(tableName)}?limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to load employee reference table data");
  return res.json();
}

export async function fetchLeaveTypes() {
  const res = await fetch(`${API_BASE}/api/dbms/leave-types`);
  if (!res.ok) throw new Error("Failed to load leave types");
  return res.json();
}

export async function fetchMyLeaveRequests(employeeId) {
  const res = await fetch(
    `${API_BASE}/api/dbms/employees/${employeeId}/leave-requests`
  );
  if (!res.ok) throw new Error("Failed to load leave requests");
  return res.json();
}

export async function createMyLeaveRequest(employeeId, payload) {
  const res = await fetch(
    `${API_BASE}/api/dbms/employees/${employeeId}/leave-requests`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    let message = "Failed to create leave request";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch (_) {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}

export async function fetchAdminLeaveRequests(adminId, status = "PENDING") {
  const res = await fetch(
    `${API_BASE}/api/dbms/admin/leave-requests?adminId=${encodeURIComponent(
      adminId
    )}&status=${encodeURIComponent(status)}`
  );
  if (!res.ok) throw new Error("Failed to load leave requests for approval");
  return res.json();
}

export async function fetchAdminEmployeeLeaveRequests(adminId, employeeId) {
  const res = await fetch(
    `${API_BASE}/api/dbms/admin/employees/${encodeURIComponent(
      employeeId
    )}/leave-requests?adminId=${encodeURIComponent(adminId)}`
  );
  if (!res.ok) throw new Error("Failed to load employee leave requests");
  return res.json();
}

export async function fetchAdminEmployeeAttendance(adminId, employeeId) {
  const res = await fetch(
    `${API_BASE}/api/dbms/admin/employees/${encodeURIComponent(
      employeeId
    )}/attendance?adminId=${encodeURIComponent(adminId)}`
  );
  if (!res.ok) throw new Error("Failed to load employee attendance");
  return res.json();
}

export async function fetchAdminEmployeePayroll(adminId, employeeId) {
  const res = await fetch(
    `${API_BASE}/api/dbms/admin/employees/${encodeURIComponent(
      employeeId
    )}/payroll?adminId=${encodeURIComponent(adminId)}`
  );
  if (!res.ok) throw new Error("Failed to load employee payroll");
  return res.json();
}

export async function decideAdminLeaveRequest(leaveRequestId, adminId, decision) {
  const res = await fetch(
    `${API_BASE}/api/dbms/admin/leave-requests/${leaveRequestId}/decision`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, decision }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to update leave request status");
  }
  return res.json();
}

export async function fetchTodayAttendance(employeeId) {
  const res = await fetch(
    `${API_BASE}/api/dbms/employees/${employeeId}/attendance/today`
  );
  if (!res.ok) throw new Error("Failed to load attendance status");
  return res.json();
}

export async function checkInToday(employeeId) {
  const res = await fetch(
    `${API_BASE}/api/dbms/employees/${employeeId}/attendance/check-in`,
    {
      method: "POST",
    }
  );
  if (!res.ok) {
    let message = "Failed to check in";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch (_) {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}

export async function checkOutToday(employeeId) {
  const res = await fetch(
    `${API_BASE}/api/dbms/employees/${employeeId}/attendance/check-out`,
    {
      method: "POST",
    }
  );
  if (!res.ok) {
    let message = "Failed to check out";
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch (_) {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}
