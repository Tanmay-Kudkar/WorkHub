import React, { useEffect, useState } from "react";
import { listEmployees, deleteEmployee } from "../services/api.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import EmployeeDetailModal from "./EmployeeDetailModal.jsx";
import SkeletonCard from "./SkeletonCard.jsx";
import AccessDeniedModal from "./AccessDeniedModal.jsx";

export default function EmployeeList({
  onEdit,
  currentUser,
  refreshKey,
  theme = "light",
}) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const isDark = theme === "dark";
  const isMaster = currentUser?.role === "ADMIN";

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 cards per page

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterKey, setFilterKey] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const startTime = Date.now();

      const data = await listEmployees(currentUser);

      // Ensure loading shows for at least 1.5 seconds for better UX
      const elapsedTime = Date.now() - startTime;
      const minLoadTime = 1500; // 1.5 seconds

      if (elapsedTime < minLoadTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadTime - elapsedTime)
        );
      }

      setItems(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Add effect to reload when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      load();
    }
  }, [refreshKey]);

  // Real-time clock for last updated
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((e) => e.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((e) =>
        statusFilter === "active" ? e.active : !e.active
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
    // Reset animation key when filters change
    setFilterKey((prev) => prev + 1);
  }, [items, searchTerm, departmentFilter, statusFilter]);

  // If filters are hidden (non-master), ensure we don't keep stale filter state.
  useEffect(() => {
    if (!isMaster) {
      setSearchTerm("");
      setDepartmentFilter("all");
      setStatusFilter("all");
    }
  }, [isMaster]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get unique departments
  const departments = [
    ...new Set(items.map((e) => e.department).filter(Boolean)),
  ];

  const onDelete = async (id) => {
    if (currentUser?.role !== "ADMIN") {
      setShowAccessDenied(true);
      return;
    }
    await deleteEmployee(id, currentUser);
    setDeleteConfirm(null);
    await load();
  };

  const handleEdit = (employee) => {
    if (currentUser?.role !== "ADMIN" && currentUser?.id !== employee.id) {
      setShowAccessDenied(true);
      return;
    }
    onEdit(employee);
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      CHF: "CHF",
      CNY: "¥",
      SEK: "kr",
      NZD: "NZ$",
    };
    return symbols[currency] || currency;
  };

  if (loading)
    return (
      <div className="space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div
            className={`h-8 w-48 rounded animate-pulse ${isDark ? "bg-slate-700" : "bg-slate-200"
              }`}
          ></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard theme={theme} />
          <SkeletonCard theme={theme} />
          <SkeletonCard theme={theme} />
          <SkeletonCard theme={theme} />
          <SkeletonCard theme={theme} />
          <SkeletonCard theme={theme} />
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className={`rounded-xl border p-8 ${isDark
          ? "bg-slate-900/95 border-slate-700 shadow-[0_20px_40px_rgba(2,6,23,0.45)]"
          : "bg-white border-slate-200 shadow-md"
          }`}
      >
        <p className="text-red-600">{error}</p>
      </div>
    );

  return (
    <>
      <div className="space-y-4">
        {/* Filter Section */}
        {isMaster && (
          <div
            className={`rounded-2xl border p-4 sm:p-6 animate-fade-in-up ${isDark
              ? "bg-slate-900/95 border-slate-700 shadow-[0_22px_44px_rgba(2,6,23,0.42)]"
              : "bg-white border-slate-200 shadow-md"
              }`}
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    className={`text-lg lg:text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"
                      }`}
                  >
                    Filter Employees
                  </h3>
                  <p
                    className={`hidden lg:block mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                  >
                    Use advanced filters to find specific employees
                  </p>
                </div>
              </div>

              {/* Desktop live time indicator */}
              <div
                className={`flex items-center gap-2 text-xs lg:text-sm ${isDark ? "text-slate-300" : "text-slate-500"
                  }`}
              >
                <div className="live-dot"></div>
                <span className="tabular-nums font-medium">
                  Last updated:{" "}
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Desktop enhanced grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label
                  className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                >
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 outline-none transition lg:shadow-sm lg:hover:shadow-md ${isDark
                      ? "border-slate-600 bg-slate-900/80 text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25"
                      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      }`}
                  />
                  <svg
                    className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label
                  className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                >
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition ${isDark
                    ? "border-slate-600 bg-slate-900/80 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25"
                    : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label
                  className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                >
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition ${isDark
                    ? "border-slate-600 bg-slate-900/80 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25"
                    : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Desktop-only advanced filter */}
              <div className="hidden lg:block">
                <label
                  className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                >
                  Sort By
                </label>
                <select
                  className={`w-full rounded-xl border px-4 py-2.5 outline-none transition shadow-sm hover:shadow-md ${isDark
                    ? "border-slate-600 bg-slate-900/80 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25"
                    : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="department">Department</option>
                  <option value="hireDate">Hire Date</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm ||
              departmentFilter !== "all" ||
              statusFilter !== "all") && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    Showing {filteredItems.length} of {items.length} employees
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setDepartmentFilter("all");
                      setStatusFilter("all");
                    }}
                    className={`text-sm font-medium ${isDark
                      ? "text-cyan-300 hover:text-cyan-200"
                      : "text-blue-600 hover:text-blue-700"
                      }`}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              className={`flex items-center gap-3 text-2xl font-bold lg:text-3xl ${isDark ? "text-slate-100" : "text-slate-900"
                }`}
            >
              <span>
                {isMaster ? `Employees (${filteredItems.length})` : "Employee Profile"}
              </span>
              {/* Desktop-only stats (master only) */}
              {isMaster && (
                <div className="hidden lg:flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${isDark
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-green-100 text-green-800"
                      }`}
                  >
                    {filteredItems.filter((e) => e.active).length} Active
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${isDark
                      ? "bg-slate-700 text-slate-100"
                      : "bg-slate-100 text-slate-800"
                      }`}
                  >
                    {filteredItems.filter((e) => !e.active).length} Inactive
                  </span>
                </div>
              )}
            </h2>
            {isMaster && (
              <p
                className={`mt-1 hidden items-center gap-2 text-sm lg:flex ${isDark ? "text-slate-300" : "text-slate-600"
                  }`}
              >
                <svg
                  className="w-4 h-4 text-green-500 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 8 8"
                >
                  <circle cx="4" cy="4" r="3" />
                </svg>
                <span className="tabular-nums">
                  Live data as of {currentTime.toLocaleTimeString()}
                </span>
              </p>
            )}
          </div>

          {/* Desktop enhanced pagination info */}
          {isMaster && totalPages > 1 && (
            <div className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <div
                className={`rounded-lg px-3 py-2 border ${isDark
                  ? "bg-slate-900 border-slate-700"
                  : "bg-slate-50 border-slate-200"
                  }`}
              >
                <p className="font-medium">
                  Page {currentPage} of {totalPages}
                </p>
                <p
                  className={`mt-1 hidden text-xs lg:block ${isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                >
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredItems.length)} of{" "}
                  {filteredItems.length} employees
                </p>
              </div>
            </div>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div
            className={`rounded-xl border p-8 sm:p-12 text-center animate-fadeIn ${isDark
              ? "bg-slate-900/95 border-slate-700 shadow-[0_18px_40px_rgba(2,6,23,0.42)]"
              : "bg-white border-slate-200 shadow-md"
              }`}
          >
            <svg
              className={`mx-auto mb-4 h-16 w-16 ${isDark ? "text-slate-600" : "text-slate-300"
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className={`text-lg ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              {items.length === 0
                ? "No employees found"
                : "No employees match your filters"}
            </p>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setDepartmentFilter("all");
                  setStatusFilter("all");
                }}
                className={`mt-4 font-semibold ${isDark
                  ? "text-cyan-300 hover:text-cyan-200"
                  : "text-blue-600 hover:text-blue-700"
                  }`}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={
                isMaster
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "w-full max-w-6xl mx-auto flex flex-col gap-6"
              }
              key={filterKey}
            >
              {currentItems.map((e, index) => {
                // Alternate direction based on column position in grid
                const columnIndex = index % 3;
                const direction =
                  columnIndex === 0
                    ? "left"
                    : columnIndex === 1
                      ? "center"
                      : "right";

                let animationClass = "animate-slideInLeft";
                if (direction === "right")
                  animationClass = "animate-slideInRight";
                if (direction === "center")
                  animationClass = "animate-slideInCenter";

                const isOwnProfile = currentUser?.id === e.id;
                const canEdit = currentUser?.role === "ADMIN" || isOwnProfile;
                const canDelete =
                  currentUser?.role === "ADMIN" && !isOwnProfile;

                if (!isMaster) {
                  const missingFieldText = "Not provided yet";
                  return (
                    <div
                      key={`${e.id}-${filterKey}`}
                      className={`${animationClass} w-full`}
                      style={{
                        animationDelay: `${index * 80}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      <div
                        className={`border-b pb-8 ${isDark ? "border-slate-700/60" : "border-slate-200"
                          }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-4">
                            <div
                              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold ring-2 overflow-hidden ${isDark
                                ? "bg-slate-900 text-slate-100 ring-slate-700"
                                : "bg-white text-slate-700 ring-slate-200"
                                }`}
                            >
                              {e.profileImage ? (
                                <img
                                  src={e.profileImage}
                                  alt={`${e.firstName || "Employee"} profile`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>
                                  {e.firstName?.[0]}
                                  {e.lastName?.[0]}
                                </span>
                              )}
                            </div>

                            <div className="text-center sm:text-left">
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                <h3
                                  className={`text-2xl sm:text-3xl leading-tight font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"
                                    }`}
                                >
                                  {e.firstName} {e.lastName}
                                </h3>
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${e.active
                                    ? isDark
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : "bg-green-100 text-green-800"
                                    : isDark
                                      ? "bg-slate-800 text-slate-200"
                                      : "bg-slate-100 text-slate-700"
                                    }`}
                                >
                                  {e.active ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <p
                                className={`mt-1 text-sm sm:text-base font-semibold ${isDark ? "text-slate-300" : "text-slate-800"
                                  }`}
                              >
                                {e.position || "Employee"}
                              </p>
                            </div>
                          </div>

                          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end sm:pt-1">
                            <button
                              type="button"
                              onClick={() => setViewEmployee(e)}
                              className="flex-1 sm:flex-none rounded-lg btn-gradient-blue px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              View Details
                            </button>
                            {canEdit ? (
                              <button
                                type="button"
                                onClick={() => handleEdit(e)}
                                className="rounded-lg bg-gradient-to-r from-slate-500 to-slate-600 text-white px-3 py-2 text-sm font-semibold hover:shadow-lg active:scale-95 transition-all duration-200"
                                title="Edit"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowAccessDenied(true)}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${isDark
                                  ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                                  : "bg-slate-300 hover:bg-slate-400 text-slate-600 hover:text-slate-700"
                                  }`}
                                title="Contact Admin"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                          <div
                            className={`flex items-start gap-3 text-sm sm:text-base font-semibold min-w-0 ${isDark ? "text-slate-300" : "text-slate-800"
                              }`}
                          >
                            <svg
                              className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-slate-500" : "text-slate-600"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="break-all sm:truncate">{e.email}</span>
                          </div>

                          <div
                            className={`flex items-center gap-3 text-sm sm:text-base font-semibold ${isDark ? "text-slate-300" : "text-slate-800"
                              }`}
                          >
                            <svg
                              className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-slate-500" : "text-slate-600"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>
                              {e.phone
                                ? `${e.phoneCountryCode || "+1"} ${e.phone}`
                                : missingFieldText}
                            </span>
                          </div>

                          <div
                            className={`flex items-start gap-3 text-sm sm:text-base font-semibold md:col-span-2 ${isDark ? "text-slate-300" : "text-slate-800"
                              }`}
                          >
                            <svg
                              className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-slate-500" : "text-slate-600"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="break-words leading-snug">
                              {e.address || missingFieldText}
                            </span>
                          </div>
                          {e.department && (
                            <div
                              className={`flex items-center gap-3 text-sm sm:text-base font-semibold ${isDark
                                ? "text-slate-300"
                                : "text-slate-800"
                                }`}
                            >
                              <svg
                                className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-slate-500" : "text-slate-600"
                                  }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <span>{e.department}</span>
                            </div>
                          )}

                          {e.salary && (
                            <div
                              className={`flex items-center gap-3 text-sm sm:text-base font-semibold ${isDark
                                ? "text-slate-300"
                                : "text-slate-800"
                                }`}
                            >
                              <svg
                                className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-slate-500" : "text-slate-600"
                                  }`}
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-semibold">
                                {getCurrencySymbol(e.currency || "USD")} {" "}
                                {Number(e.salary).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {canDelete && (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(e)}
                              className="rounded-lg btn-gradient-red px-3 py-2 text-sm font-semibold text-white hover:shadow-lg transition-shadow"
                              title="Delete"
                            >
                              <span className="inline-flex items-center gap-2">
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${e.id}-${filterKey}`}
                    className={`group rounded-xl border overflow-hidden transition-all duration-300 ${animationClass} ${!isMaster ? "w-full max-w-md" : ""} ${isDark
                      ? "bg-slate-900/95 border-slate-700 shadow-[0_18px_34px_rgba(2,6,23,0.42)] hover:shadow-[0_24px_42px_rgba(2,6,23,0.52)]"
                      : "bg-white border-slate-200 shadow-md hover:shadow-xl hover:scale-[1.02]"
                      }`}
                    style={{
                      animationDelay: `${index * 80}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    {/* Card Header */}
                    <div className="h-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-[length:200%_200%] animate-cardGradient relative motion-safe:animate-float">
                      {/* Desktop-only pattern overlay */}
                      <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                      <div className="absolute -bottom-10 lg:-bottom-12 left-6">
                        <div
                          className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full shadow-lg flex items-center justify-center text-2xl lg:text-3xl font-bold border-4 relative overflow-hidden ${isDark
                            ? "bg-slate-900 text-slate-100 border-slate-200"
                            : "bg-white text-slate-700 border-white"
                            }`}
                        >
                          {/* Desktop-only shimmer effect */}
                          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-shimmer"></div>
                          {e.profileImage ? (
                            <img
                              src={e.profileImage}
                              alt={`${e.firstName || "Employee"} profile`}
                              className="relative z-10 w-full h-full object-cover"
                            />
                          ) : (
                            <span className="relative z-10">
                              {e.firstName?.[0]}
                              {e.lastName?.[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold shadow-lg ${e.active
                            ? isDark
                              ? "bg-emerald-500/25 text-emerald-200"
                              : "bg-green-100 text-green-800 lg:bg-green-500 lg:text-white"
                            : isDark
                              ? "bg-slate-700 text-slate-100"
                              : "bg-slate-100 text-slate-800 lg:bg-slate-500 lg:text-white"
                            }`}
                        >
                          {e.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="pt-12 px-4 sm:px-6 pb-5 sm:pb-6">
                      <h3
                        className={`mb-1 text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                      >
                        {e.firstName} {e.lastName}
                      </h3>
                      <p
                        className={`mb-4 text-sm ${isDark ? "text-slate-300" : "text-slate-500"
                          }`}
                      >
                        {e.position || "Employee"}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div
                          className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"
                            }`}
                        >
                          <svg
                            className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"
                              }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="truncate">{e.email}</span>
                        </div>
                        {e.phone && (
                          <div
                            className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"
                              }`}
                          >
                            <svg
                              className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span>
                              {e.phoneCountryCode || "+1"} {e.phone}
                            </span>
                          </div>
                        )}
                        {e.department && (
                          <div
                            className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"
                              }`}
                          >
                            <svg
                              className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span>{e.department}</span>
                          </div>
                        )}
                        {e.salary && (
                          <div
                            className={`flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"
                              }`}
                          >
                            <svg
                              className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-400"
                                }`}
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold">
                              {getCurrencySymbol(e.currency || "USD")}{" "}
                              {Number(e.salary).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Desktop enhanced actions */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setViewEmployee(e)}
                          className="flex-1 rounded-lg btn-gradient-blue px-3 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          View Details
                        </button>
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => handleEdit(e)}
                            className="rounded-lg bg-gradient-to-r from-slate-500 to-slate-600 text-white px-3 py-2 text-sm font-semibold hover:shadow-lg active:scale-95 transition-all duration-200"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowAccessDenied(true)}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${isDark
                              ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                              : "bg-slate-300 hover:bg-slate-400 text-slate-600 hover:text-slate-700"
                              }`}
                            title="Contact Admin"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(e)}
                            className="rounded-lg btn-gradient-red px-3 py-2 text-sm font-semibold text-white hover:shadow-lg transition-shadow"
                            title="Delete"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls (master only) */}
            {isMaster && totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pb-4">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`rounded-lg border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isDark
                    ? "border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  ← Prev
                </button>
                <span className={`px-2 sm:px-3 py-2 text-xs sm:text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`rounded-lg border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isDark
                    ? "border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Keep a single, well-formed style block. Avoid '//' inside template literal. */}
      <style>{`
        @keyframes cardGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideInCenter {
          from { opacity: 0; transform: translateY(30px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); background-color: #10b981; }
          50% { opacity: 0.6; transform: scale(1.2); background-color: #059669; }
        }
        .animate-cardGradient { animation: cardGradient 8s ease infinite; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slideInCenter { animation: slideInCenter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-slideInRight { animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .live-dot { width: 6px; height: 6px; border-radius: 50%; animation: livePulse 2s ease-in-out infinite; }
        .tabular-nums { font-variant-numeric: tabular-nums; font-family: 'SF Mono','Monaco','Inconsolata','Roboto Mono',monospace; }
      `}</style>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Employee?"
        message={`Are you sure you want to delete ${deleteConfirm?.firstName} ${deleteConfirm?.lastName}? This action cannot be undone.`}
        onConfirm={() => onDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
        theme={theme}
      />

      <EmployeeDetailModal
        employee={viewEmployee}
        onClose={() => setViewEmployee(null)}
        onEdit={onEdit}
        currentUser={currentUser}
        theme={theme}
      />

      <AccessDeniedModal
        isOpen={showAccessDenied}
        onClose={() => setShowAccessDenied(false)}
        theme={theme}
      />
    </>
  );
}
