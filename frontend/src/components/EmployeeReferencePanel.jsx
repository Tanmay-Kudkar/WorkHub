import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
    checkInToday,
    checkOutToday,
    createEmployeePayroll,
    createMyLeaveRequest,
    decideAdminLeaveRequest,
    fetchEmployeePayroll,
    fetchAdminLeaveRequests,
    fetchAdminEmployeeAttendance,
    fetchAdminEmployeeLeaveRequests,
    fetchAdminEmployeePayroll,
    fetchLeaveTypes,
    fetchMyLeaveRequests,
    fetchReferenceOverview,
    fetchReferenceTableData,
    fetchTodayAttendance,
    adminListEmployees,
} from "../services/api.js";

const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

function formatDisplayValue(value) {
    if (value == null) return "";
    if (typeof value !== "string") return String(value);
    if (!ISO_TIMESTAMP_REGEX.test(value)) return value;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value.replace("T", " ").replace(/([+-]\d{2}:\d{2}|Z)$/, "");
    }

    return parsed.toLocaleString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

export default function EmployeeReferencePanel({
    currentUser,
    theme = "light",
    mode = "launcher", // 'launcher' (dashboard) | 'page' (dedicated route)
}) {
    const isDark = theme === "dark";
    const employeeId = Number(currentUser?.id || 0);
    const isAdmin = String(currentUser?.role || "").toUpperCase() === "ADMIN";
    const canUseImplementation = employeeId > 0;

    const navigate = useNavigate();
    const { page } = useParams();

    const allowedPages = isAdmin
        ? ["attendance", "leave", "payroll", "admin-data"]
        : ["attendance", "leave", "payroll"];

    const resolvedPage =
        mode === "page" && typeof page === "string" && allowedPages.includes(page)
            ? page
            : mode === "page"
                ? allowedPages[0]
                : "home";

    if (mode === "page") {
        if (!page || !allowedPages.includes(String(page))) {
            return <Navigate to={`/workspace/${allowedPages[0]}`} replace />;
        }
    }

    const [overview, setOverview] = useState(null);
    const [selectedTable, setSelectedTable] = useState("");
    const [tableData, setTableData] = useState([]);
    const [loadingOverview, setLoadingOverview] = useState(true);
    const [loadingTable, setLoadingTable] = useState(false);

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [loadingApprovals, setLoadingApprovals] = useState(false);
    const [attendanceToday, setAttendanceToday] = useState(null);
    const [payrollRows, setPayrollRows] = useState([]);
    const [payrollForm, setPayrollForm] = useState({
        salary: "",
        bonus: "",
        deductions: "",
        payDate: "",
    });

    const [adminEmployees, setAdminEmployees] = useState([]);
    const [adminEmployeeId, setAdminEmployeeId] = useState("");
    const [adminAuthId, setAdminAuthId] = useState(0);
    const [adminAttendance, setAdminAttendance] = useState([]);
    const [adminLeaves, setAdminLeaves] = useState([]);
    const [adminPayroll, setAdminPayroll] = useState([]);
    const [loadingAdminEmployees, setLoadingAdminEmployees] = useState(false);
    const [loadingAdminData, setLoadingAdminData] = useState(false);

    const [leaveForm, setLeaveForm] = useState({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
    });

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        setError("");
        setNotice("");
    }, [mode, resolvedPage]);

    useEffect(() => {
        if (!notice) return undefined;
        const timer = setTimeout(() => setNotice(""), 3500);
        return () => clearTimeout(timer);
    }, [notice]);

    const navItems = useMemo(
        () => {
            const items = [
                { id: "attendance", label: "Attendance" },
                { id: "leave", label: "Leave" },
                { id: "payroll", label: "Payroll" },
            ];
            if (isAdmin) {
                items.push({ id: "admin-data", label: "Admin Data" });
            }
            return items;
        },
        [isAdmin]
    );

    useEffect(() => {
        if (mode !== "page" || resolvedPage !== "tables") return;

        let mounted = true;
        setLoadingOverview(true);
        fetchReferenceOverview()
            .then((data) => {
                if (!mounted) return;
                setOverview(data);
                setSelectedTable(data?.tables?.[0]?.tableName || "");
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e.message || "Failed to load reference overview.");
            })
            .finally(() => {
                if (!mounted) return;
                setLoadingOverview(false);
            });

        return () => {
            mounted = false;
        };
    }, [mode, resolvedPage]);

    useEffect(() => {
        if (mode !== "page" || resolvedPage !== "tables") return;
        if (!selectedTable) return;
        let mounted = true;
        setLoadingTable(true);

        fetchReferenceTableData(selectedTable, 8)
            .then((data) => {
                if (!mounted) return;
                setTableData(data?.rows || []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e.message || "Failed to load table data.");
            })
            .finally(() => {
                if (!mounted) return;
                setLoadingTable(false);
            });

        return () => {
            mounted = false;
        };
    }, [mode, resolvedPage, selectedTable]);

    useEffect(() => {
        if (mode !== "page") return;
        if (!canUseImplementation) return;

        let mounted = true;
        Promise.all([
            fetchLeaveTypes(),
            fetchMyLeaveRequests(employeeId),
            fetchTodayAttendance(employeeId),
            fetchEmployeePayroll(employeeId),
        ])
            .then(([types, leaves, attendance, payroll]) => {
                if (!mounted) return;
                setLeaveTypes(types || []);
                setLeaveRequests(leaves || []);
                setAttendanceToday(attendance || null);
                setPayrollRows(payroll || []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e.message || "Failed to load implementation pages.");
            });

        return () => {
            mounted = false;
        };
    }, [mode, canUseImplementation, employeeId]);

    useEffect(() => {
        if (mode !== "page") return;
        if (!isAdmin) return;
        if (resolvedPage !== "admin-data") return;

        let mounted = true;
        setLoadingAdminEmployees(true);
        adminListEmployees()
            .then((rows) => {
                if (!mounted) return;
                setAdminEmployees(rows || []);
                const currentEmail = String(currentUser?.email || "").toLowerCase();
                const resolvedAdmin = (rows || []).find(
                    (emp) => String(emp?.email || "").toLowerCase() === currentEmail
                );
                if (employeeId > 0) {
                    setAdminAuthId(employeeId);
                } else if (resolvedAdmin?.id) {
                    setAdminAuthId(Number(resolvedAdmin.id));
                }
                if (!adminEmployeeId && rows && rows.length > 0) {
                    setAdminEmployeeId(String(rows[0].id));
                }
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e.message || "Failed to load employees.");
            })
            .finally(() => {
                if (!mounted) return;
                setLoadingAdminEmployees(false);
            });

        return () => {
            mounted = false;
        };
    }, [mode, isAdmin, resolvedPage]);

    useEffect(() => {
        if (mode !== "page") return;
        if (!isAdmin) return;
        if (resolvedPage !== "admin-data") return;
        if (!adminEmployeeId) return;
        if (!adminAuthId || adminAuthId <= 0) return;

        let mounted = true;
        setLoadingAdminData(true);
        Promise.all([
            fetchAdminEmployeeAttendance(adminAuthId, adminEmployeeId),
            fetchAdminEmployeeLeaveRequests(adminAuthId, adminEmployeeId),
            fetchAdminEmployeePayroll(adminAuthId, adminEmployeeId),
        ])
            .then(([attendanceRows, leaveRows, payrollRows]) => {
                if (!mounted) return;
                setAdminAttendance(attendanceRows || []);
                setAdminLeaves(leaveRows || []);
                setAdminPayroll(payrollRows || []);
            })
            .catch((e) => {
                if (!mounted) return;
                setError(e.message || "Failed to load employee data.");
            })
            .finally(() => {
                if (!mounted) return;
                setLoadingAdminData(false);
            });

        return () => {
            mounted = false;
        };
    }, [mode, isAdmin, resolvedPage, adminEmployeeId, adminAuthId, employeeId]);

    const headers = tableData.length ? Object.keys(tableData[0]) : [];

    const resetMessages = () => {
        setError("");
        setNotice("");
    };

    const loadPendingApprovals = useCallback(async () => {
        if (!isAdmin || !canUseImplementation) return;
        setLoadingApprovals(true);
        try {
            const rows = await fetchAdminLeaveRequests(employeeId, "PENDING");
            setPendingApprovals(rows || []);
        } catch (e) {
            setError(e.message || "Failed to load pending approvals.");
        } finally {
            setLoadingApprovals(false);
        }
    }, [isAdmin, canUseImplementation, employeeId]);

    useEffect(() => {
        if (mode !== "page") return;
        if (resolvedPage !== "leave") return;
        if (!isAdmin) return;
        if (!canUseImplementation) return;
        loadPendingApprovals();
    }, [mode, resolvedPage, isAdmin, canUseImplementation, loadPendingApprovals]);

    const handleCheckIn = async () => {
        resetMessages();
        try {
            const data = await checkInToday(employeeId);

            const looksLikeAttendance =
                data &&
                (Object.prototype.hasOwnProperty.call(data, "attendanceStatus") ||
                    Object.prototype.hasOwnProperty.call(data, "checkInTime") ||
                    Object.prototype.hasOwnProperty.call(data, "checkOutTime"));

            if (looksLikeAttendance) {
                setAttendanceToday(data);
            } else {
                const latest = await fetchTodayAttendance(employeeId);
                setAttendanceToday(latest || null);
            }
            setNotice("Checked in.");
        } catch (e) {
            setError(e.message || "Check-in failed.");
        }
    };

    const handleCheckOut = async () => {
        resetMessages();
        try {
            const data = await checkOutToday(employeeId);

            const looksLikeAttendance =
                data &&
                (Object.prototype.hasOwnProperty.call(data, "attendanceStatus") ||
                    Object.prototype.hasOwnProperty.call(data, "checkInTime") ||
                    Object.prototype.hasOwnProperty.call(data, "checkOutTime"));

            if (looksLikeAttendance) {
                setAttendanceToday(data);
            } else {
                const latest = await fetchTodayAttendance(employeeId);
                setAttendanceToday(latest || null);
            }
            setNotice("Checked out.");
        } catch (e) {
            setError(e.message || "Check-out failed.");
        }
    };

    const handleSubmitLeave = async (event) => {
        event.preventDefault();
        resetMessages();

        if (!leaveForm.leaveTypeId) {
            setError("Please select a leave type.");
            return;
        }

        if (leaveForm.startDate && leaveForm.endDate) {
            const start = new Date(`${leaveForm.startDate}T00:00:00`);
            const end = new Date(`${leaveForm.endDate}T00:00:00`);
            if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
                setError("To date must be the same as or after From date.");
                return;
            }
        }
        try {
            await createMyLeaveRequest(employeeId, {
                leaveTypeId: Number(leaveForm.leaveTypeId),
                startDate: leaveForm.startDate,
                endDate: leaveForm.endDate,
                reason: leaveForm.reason,
            });
            setNotice("Leave request submitted.");
            setLeaveForm((prev) => ({ ...prev, startDate: "", endDate: "", reason: "" }));
            const rows = await fetchMyLeaveRequests(employeeId);
            setLeaveRequests(rows || []);
        } catch (e) {
            setError(e.message || "Leave request failed.");
        }
    };

    const handleDecision = async (leaveRequestId, decision) => {
        resetMessages();
        try {
            await decideAdminLeaveRequest(leaveRequestId, employeeId, decision);
            setNotice(`Leave request ${String(decision).toLowerCase()}.`);
            await loadPendingApprovals();
        } catch (e) {
            setError(e.message || "Failed to update leave request.");
        }
    };


    const handleAddPayroll = async (event) => {
        event.preventDefault();
        resetMessages();
        try {
            await createEmployeePayroll(employeeId, {
                salary: payrollForm.salary === "" ? null : Number(payrollForm.salary),
                bonus: payrollForm.bonus === "" ? null : Number(payrollForm.bonus),
                deductions:
                    payrollForm.deductions === "" ? null : Number(payrollForm.deductions),
                payDate: payrollForm.payDate,
            });
            setNotice("Payroll entry added.");
            setPayrollForm({ salary: "", bonus: "", deductions: "", payDate: "" });
            const rows = await fetchEmployeePayroll(employeeId);
            setPayrollRows(rows || []);
        } catch (e) {
            setError(e.message || "Payroll save failed.");
        }
    };

    const panelClass = `rounded-xl border p-4 sm:p-5 ${isDark ? "border-slate-700 bg-slate-950/60 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-900"
        }`;

    const tabBaseClass =
        "rounded-xl px-4 py-2.5 text-sm font-semibold border transition-colors whitespace-nowrap";
    const tabActiveClass =
        isDark
            ? "border-blue-400 bg-slate-50 text-blue-900"
            : "border-blue-500 bg-blue-50 text-blue-900";
    const tabIdleClass = isDark
        ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white";

    const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${isDark
        ? "bg-slate-950/40 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20"
        : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20"
        }`;
    const selectClass = `${inputClass} pr-10`;
    const primaryButtonClass =
        "w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40";
    const successButtonClass =
        "rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40";
    const indigoButtonClass =
        "rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

    return (
        <section
            className={`mt-6 rounded-2xl border ${isDark ? "bg-slate-900/90 border-slate-700" : "bg-white border-slate-200"
                }`}
        >
            <style>
                {`
                                    .wh-date-input { color-scheme: dark; }
                                    .wh-date-input::-webkit-calendar-picker-indicator {
                                        filter: invert(1) brightness(1.1) contrast(1.2) !important;
                                        opacity: 0.9;
                                    }
                                    .wh-number-input { appearance: textfield; }
                                    .wh-number-input::-webkit-outer-spin-button,
                                    .wh-number-input::-webkit-inner-spin-button {
                                        appearance: none;
                                        margin: 0;
                                    }
                                `}
            </style>

            <div className="p-4 sm:p-6 border-b border-inherit">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className={`text-xl sm:text-2xl font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            Employee Data Workspace
                        </h2>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            Dedicated pages for attendance, leave, payroll, and admin data.
                        </p>
                    </div>

                    {mode === "page" && (
                        <button
                            type="button"
                            onClick={() => {
                                navigate("/");
                            }}
                            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold border ${isDark
                                ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                                }`}
                        >
                            Back to Dashboard
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="mb-4 flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                navigate(`/workspace/${item.id}`);
                            }}
                            className={`${tabBaseClass} ${mode === "page" && resolvedPage === item.id
                                ? tabActiveClass
                                : tabIdleClass
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {mode !== "page" && (
                    <div className={panelClass}>
                        <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            Open one of the pages above. Each one loads as a separate route.
                        </p>
                    </div>
                )}

                {mode === "page" && resolvedPage === "admin-data" && isAdmin && (
                    <div className={panelClass}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className={`text-base font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                                    Master Admin: Employee Data
                                </h3>
                                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                    View attendance, leave, and payroll for any employee.
                                </p>
                            </div>
                            <div className="min-w-[240px]">
                                <select
                                    value={adminEmployeeId}
                                    onChange={(e) => setAdminEmployeeId(e.target.value)}
                                    className={`${selectClass} appearance-none pr-12 cursor-pointer`}
                                    disabled={loadingAdminEmployees}
                                >
                                    {adminEmployees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName} ({emp.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loadingAdminEmployees || loadingAdminData ? (
                            <p className={`mt-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                Loading employee data...
                            </p>
                        ) : (
                            <div className="mt-4 grid grid-cols-1 gap-4">
                                <div className={`rounded-xl border p-3 ${isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-white"}`}>
                                    <h4 className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Attendance</h4>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="min-w-[560px] text-xs sm:min-w-full sm:text-sm">
                                            <thead className={isDark ? "text-slate-300" : "text-slate-600"}>
                                                <tr>
                                                    <th className="px-2 py-2 text-left font-semibold">Date</th>
                                                    <th className="px-2 py-2 text-left font-semibold">Check-in</th>
                                                    <th className="px-2 py-2 text-left font-semibold">Check-out</th>
                                                    <th className="px-2 py-2 text-left font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className={isDark ? "text-slate-200" : "text-slate-800"}>
                                                {(adminAttendance || []).map((row) => (
                                                    <tr key={row.id} className={isDark ? "border-t border-slate-800" : "border-t border-slate-100"}>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.attendanceDate}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.checkInTime ? formatDisplayValue(row.checkInTime) : "-"}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.checkOutTime ? formatDisplayValue(row.checkOutTime) : "-"}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.attendanceStatus}</td>
                                                    </tr>
                                                ))}
                                                {(adminAttendance || []).length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className={`px-2 py-3 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                            No attendance records.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className={`rounded-xl border p-3 ${isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-white"}`}>
                                    <h4 className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Leave Requests</h4>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="min-w-[560px] text-xs sm:min-w-full sm:text-sm">
                                            <thead className={isDark ? "text-slate-300" : "text-slate-600"}>
                                                <tr>
                                                    <th className="px-2 py-2 text-left font-semibold">Type</th>
                                                    <th className="px-2 py-2 text-left font-semibold">From</th>
                                                    <th className="px-2 py-2 text-left font-semibold">To</th>
                                                    <th className="px-2 py-2 text-left font-semibold">Status</th>
                                                    <th className="px-2 py-2 text-left font-semibold">Applied</th>
                                                </tr>
                                            </thead>
                                            <tbody className={isDark ? "text-slate-200" : "text-slate-800"}>
                                                {(adminLeaves || []).map((row) => (
                                                    <tr key={row.id} className={isDark ? "border-t border-slate-800" : "border-t border-slate-100"}>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.leaveType}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.startDate}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.endDate}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.approvalStatus}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.appliedOn ? formatDisplayValue(row.appliedOn) : "-"}</td>
                                                    </tr>
                                                ))}
                                                {(adminLeaves || []).length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className={`px-2 py-3 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                            No leave requests.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className={`rounded-xl border p-3 ${isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-white"}`}>
                                    <h4 className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Payroll</h4>
                                    <div className="mt-2 overflow-x-auto">
                                        <table className="min-w-[560px] text-xs sm:min-w-full sm:text-sm">
                                            <thead className={isDark ? "text-slate-300" : "text-slate-600"}>
                                                <tr>
                                                    <th className="px-2 py-2 text-left font-semibold">Pay Date</th>
                                                    <th className="px-2 py-2 text-left font-semibold">Salary</th>
                                                    <th className="px-2 py-2 text-left font-semibold">Bonus</th>
                                                    <th className="px-2 py-2 text-left font-semibold">Deductions</th>
                                                </tr>
                                            </thead>
                                            <tbody className={isDark ? "text-slate-200" : "text-slate-800"}>
                                                {(adminPayroll || []).map((row) => (
                                                    <tr key={row.id} className={isDark ? "border-t border-slate-800" : "border-t border-slate-100"}>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.payDate}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.salary ?? "-"}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.bonus ?? "-"}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.deductions ?? "-"}</td>
                                                    </tr>
                                                ))}
                                                {(adminPayroll || []).length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className={`px-2 py-3 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                            No payroll entries.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === "page" && !canUseImplementation && resolvedPage !== "tables" && (
                    <p className="mb-3 text-sm text-amber-500">
                        Login using a real employee account to use these pages.
                    </p>
                )}

                {mode === "page" && resolvedPage === "attendance" && (
                    <div className={panelClass}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                            <div>
                                <p className={isDark ? "text-slate-300" : "text-slate-600"}>Status</p>
                                <p className="mt-0.5 font-semibold">{attendanceToday?.attendanceStatus || "NOT_MARKED"}</p>
                            </div>
                            <div>
                                <p className={isDark ? "text-slate-300" : "text-slate-600"}>Check-in</p>
                                <p className="mt-0.5 font-semibold">
                                    {attendanceToday?.checkInTime ? formatDisplayValue(attendanceToday.checkInTime) : "-"}
                                </p>
                            </div>
                            <div>
                                <p className={isDark ? "text-slate-300" : "text-slate-600"}>Check-out</p>
                                <p className="mt-0.5 font-semibold">
                                    {attendanceToday?.checkOutTime ? formatDisplayValue(attendanceToday.checkOutTime) : "-"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" onClick={handleCheckIn} className={successButtonClass}>Check In</button>
                            <button type="button" onClick={handleCheckOut} className={indigoButtonClass}>Check Out</button>
                        </div>
                    </div>
                )}

                {mode === "page" && resolvedPage === "leave" && (
                    <div className={panelClass}>
                        <form onSubmit={handleSubmitLeave} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    Leave Type <span className="text-red-500" aria-hidden="true">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="leaveTypeId"
                                        value={leaveForm.leaveTypeId}
                                        onChange={(e) => setLeaveForm((prev) => ({ ...prev, leaveTypeId: e.target.value }))}
                                        className={`${selectClass} appearance-none pr-12 cursor-pointer`}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select leave type
                                        </option>
                                        {leaveTypes.map((type) => (
                                            <option key={type.id} value={type.id}>{type.leaveName}</option>
                                        ))}
                                    </select>
                                    <svg
                                        className={`pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    From <span className="text-red-500" aria-hidden="true">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={leaveForm.startDate}
                                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, startDate: e.target.value }))}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    onFocus={(e) => e.currentTarget.showPicker?.()}
                                    className={`${inputClass} wh-date-input`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    To <span className="text-red-500" aria-hidden="true">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={leaveForm.endDate}
                                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))}
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                    onFocus={(e) => e.currentTarget.showPicker?.()}
                                    min={leaveForm.startDate || undefined}
                                    className={`${inputClass} wh-date-input`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    Reason <span className="text-red-500" aria-hidden="true">*</span>
                                </label>
                                <input
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Reason"
                                    className={inputClass}
                                    required
                                />
                            </div>
                            <button type="submit" className={`${primaryButtonClass} md:col-span-2`}>Submit Leave</button>
                        </form>

                        {isAdmin && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className={`text-base font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                                        Pending Approvals
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={loadPendingApprovals}
                                        className={`rounded-lg px-3 py-2 text-sm font-semibold border ${isDark
                                            ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                                            }`}
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {loadingApprovals ? (
                                    <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                        Loading pending approvals...
                                    </p>
                                ) : (
                                    <div className="mt-3 overflow-x-auto">
                                        <table className="min-w-[640px] text-xs sm:min-w-full sm:text-sm">
                                            <thead className={isDark ? "text-slate-300" : "text-slate-600"}>
                                                <tr>
                                                    <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Employee</th>
                                                    <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Type</th>
                                                    <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">From</th>
                                                    <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">To</th>
                                                    <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Reason</th>
                                                    <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Applied</th>
                                                    <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className={isDark ? "text-slate-200" : "text-slate-800"}>
                                                {(pendingApprovals || []).map((row) => (
                                                    <tr key={row.id} className={isDark ? "border-t border-slate-800" : "border-t border-slate-100"}>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.employeeName || row.employeeId}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.leaveType}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.startDate}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.endDate}</td>
                                                        <td className="px-2 py-2">{row.reason || "-"}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">{row.appliedOn ? formatDisplayValue(row.appliedOn) : "-"}</td>
                                                        <td className="px-2 py-2 whitespace-nowrap">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDecision(row.id, "APPROVED")}
                                                                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${isDark
                                                                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                                                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                                                                        }`}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDecision(row.id, "REJECTED")}
                                                                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${isDark
                                                                        ? "bg-rose-600 text-white hover:bg-rose-500"
                                                                        : "bg-rose-600 text-white hover:bg-rose-500"
                                                                        }`}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {(pendingApprovals || []).length === 0 && (
                                                    <tr>
                                                        <td
                                                            className={`px-2 py-4 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}
                                                            colSpan={7}
                                                        >
                                                            No pending approvals.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-[720px] text-xs sm:min-w-full sm:text-sm">
                                <thead className={isDark ? "text-slate-300" : "text-slate-600"}>
                                    <tr>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Type</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">From</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">To</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Reason</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Status</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Applied</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Approved By</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Approved</th>
                                    </tr>
                                </thead>
                                <tbody className={isDark ? "text-slate-200" : "text-slate-800"}>
                                    {leaveRequests.slice(0, 10).map((row) => (
                                        <tr key={row.id} className={isDark ? "border-t border-slate-800" : "border-t border-slate-100"}>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.leaveType}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.startDate}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.endDate}</td>
                                            <td className="px-2 py-2">{row.reason || "-"}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.approvalStatus}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.appliedOn ? formatDisplayValue(row.appliedOn) : "-"}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.approvedByName || "-"}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">
                                                {row.approvedOn ? formatDisplayValue(row.approvedOn) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                {mode === "page" && resolvedPage === "payroll" && (
                    <div className={panelClass}>
                        <form onSubmit={handleAddPayroll} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    Salary
                                </label>
                                <input type="number" value={payrollForm.salary} onChange={(e) => setPayrollForm((prev) => ({ ...prev, salary: e.target.value }))} placeholder="Salary" className={`${inputClass} wh-number-input`} />
                            </div>
                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    Bonus
                                </label>
                                <input type="number" value={payrollForm.bonus} onChange={(e) => setPayrollForm((prev) => ({ ...prev, bonus: e.target.value }))} placeholder="Bonus" className={`${inputClass} wh-number-input`} />
                            </div>
                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    Deductions
                                </label>
                                <input type="number" value={payrollForm.deductions} onChange={(e) => setPayrollForm((prev) => ({ ...prev, deductions: e.target.value }))} placeholder="Deductions" className={`${inputClass} wh-number-input`} />
                            </div>
                            <div>
                                <label className={`mb-1 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                    Pay Date <span className="text-red-500" aria-hidden="true">*</span>
                                </label>
                                <input type="date" value={payrollForm.payDate} onChange={(e) => setPayrollForm((prev) => ({ ...prev, payDate: e.target.value }))} className={`${inputClass} wh-date-input`} required />
                            </div>
                            <button type="submit" className={`${primaryButtonClass} md:col-span-2`}>Add Payroll</button>
                        </form>
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-[560px] text-xs sm:min-w-full sm:text-sm">
                                <thead className={isDark ? "text-slate-300" : "text-slate-600"}>
                                    <tr>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Pay Date</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Salary</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Bonus</th>
                                        <th className="px-2 py-2 text-left font-semibold whitespace-nowrap">Deductions</th>
                                    </tr>
                                </thead>
                                <tbody className={isDark ? "text-slate-200" : "text-slate-800"}>
                                    {payrollRows.slice(0, 12).map((row) => (
                                        <tr key={row.id} className={isDark ? "border-t border-slate-800" : "border-t border-slate-100"}>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.payDate}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.salary}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.bonus}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{row.deductions}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {mode === "page" && resolvedPage === "tables" && (
                    <div className={panelClass}>
                        {loadingOverview ? (
                            <p>Loading table overview...</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {(overview?.tables || []).map((item) => (
                                        <button
                                            key={item.tableName}
                                            type="button"
                                            onClick={() => setSelectedTable(item.tableName)}
                                            className={`text-left rounded-xl border px-4 py-3 ${selectedTable === item.tableName
                                                ? "border-blue-500 bg-blue-50 text-blue-900"
                                                : isDark
                                                    ? "border-slate-700 bg-slate-800"
                                                    : "border-slate-200 bg-white"
                                                }`}
                                        >
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-xs opacity-75">{item.tableName}</p>
                                            <p className="text-xs mt-1">Rows: {item.rowCount}</p>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
                                    {loadingTable ? (
                                        <p className="p-3 text-sm">Loading selected table...</p>
                                    ) : headers.length === 0 ? (
                                        <p className="p-3 text-sm">No rows available.</p>
                                    ) : (
                                        <table className="min-w-[640px] text-xs sm:min-w-full sm:text-sm">
                                            <thead className={isDark ? "bg-slate-800 text-slate-100" : "bg-slate-100 text-slate-800"}>
                                                <tr>
                                                    {headers.map((header) => (
                                                        <th key={header} className="px-3 py-2 text-left whitespace-nowrap">{header}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className={isDark ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>
                                                {tableData.map((row, idx) => (
                                                    <tr key={`${selectedTable}-${idx}`} className={isDark ? "border-t border-slate-800" : "border-t border-slate-100"}>
                                                        {headers.map((header) => (
                                                            <td key={`${idx}-${header}`} className="px-3 py-2 align-top">{formatDisplayValue(row[header])}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {(error || notice) && (
                    <div
                        role="alert"
                        className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm backdrop-blur ${error
                            ? isDark
                                ? "border-red-500/40 bg-red-500/10 text-red-200"
                                : "border-red-200 bg-red-50 text-red-800"
                            : isDark
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                                : "border-emerald-200 bg-emerald-50 text-emerald-800"
                            }`}
                    >
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${error
                                ? isDark
                                    ? "bg-red-500/15 text-red-200"
                                    : "bg-red-100 text-red-700"
                                : isDark
                                    ? "bg-emerald-500/15 text-emerald-200"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                        >
                            {error ? (
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold break-words">
                                {error || notice}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => resetMessages()}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${isDark
                                ? "text-white/70 hover:text-white hover:bg-white/10"
                                : "text-slate-600 hover:text-slate-800 hover:bg-slate-200/60"
                                }`}
                            aria-label="Dismiss"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
