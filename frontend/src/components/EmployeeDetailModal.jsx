import React, { useState } from "react";
import AccessDeniedModal from "./AccessDeniedModal.jsx";

export default function EmployeeDetailModal({
  employee,
  onClose,
  onEdit,
  currentUser,
  theme = "light",
}) {
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  if (!employee) return null;

  const isDark = theme === "dark";

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
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

  const canEdit =
    currentUser?.role === "ADMIN" || currentUser?.id === employee.id;

  const labelClass = isDark
    ? "text-xs font-semibold text-slate-400 uppercase"
    : "text-xs font-semibold text-slate-500 uppercase";
  const valueClass = isDark
    ? "text-slate-100 font-medium break-words"
    : "text-slate-900 font-medium break-words";
  const headingClass = isDark
    ? "text-lg font-bold text-slate-100 mb-4 flex items-center gap-2"
    : "text-lg font-bold text-slate-900 mb-4 flex items-center gap-2";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
        <div
          className={`w-full modal-content max-w-3xl max-h-[96dvh] sm:max-h-[92vh] overflow-hidden transform animate-slideUp flex flex-col rounded-3xl sm:rounded-2xl shadow-2xl ${isDark
              ? "bg-slate-950 border border-slate-700"
              : "bg-white"
            }`}
        >
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-[length:200%_200%] animate-gradientShift p-5 sm:p-8 text-white">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl sm:text-3xl font-bold overflow-hidden">
                {employee.profileImage ? (
                  <img
                    src={employee.profileImage}
                    alt="Employee profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {employee.firstName?.[0]}
                    {employee.lastName?.[0]}
                  </>
                )}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-white/90 mt-1 text-sm sm:text-base">
                  {employee.position || "Employee"} •{" "}
                  {employee.department || "General"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`flex-1 overflow-y-auto p-4 sm:p-8 pb-24 sm:pb-8 ${isDark ? "bg-slate-950/90" : "bg-white"
              }`}
          >
            {!employee.firstName ? (
              // Loading skeleton for modal
              <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`rounded-xl h-48 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}></div>
                  <div className={`rounded-xl h-48 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}></div>
                  <div className={`rounded-xl h-48 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}></div>
                  <div className={`rounded-xl h-48 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Contact Information */}
                <div
                  className={`rounded-2xl p-5 sm:p-6 border ${isDark
                      ? "bg-gradient-to-br from-slate-900 to-blue-950 border-blue-900/50"
                      : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                    }`}
                >
                  <h3 className={headingClass}>
                    <svg
                      className={`w-5 h-5 ${isDark ? "text-blue-300" : "text-blue-600"}`}
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
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>
                        Email
                      </label>
                      <p className={valueClass}>
                        {employee.email}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Phone
                      </label>
                      <p className={valueClass}>
                        {employee.phone
                          ? `${employee.phoneCountryCode || "+1"} ${employee.phone
                          }`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Address
                      </label>
                      <p className={valueClass}>
                        {employee.address || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div
                  className={`rounded-2xl p-5 sm:p-6 border ${isDark
                      ? "bg-gradient-to-br from-slate-900 to-violet-950 border-violet-900/50"
                      : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
                    }`}
                >
                  <h3 className={headingClass}>
                    <svg
                      className={`w-5 h-5 ${isDark ? "text-violet-300" : "text-purple-600"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Employment Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>
                        Department
                      </label>
                      <p className={valueClass}>
                        {employee.department || "-"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Position
                      </label>
                      <p className={valueClass}>
                        {employee.position || "-"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Hire Date
                      </label>
                      <p className={valueClass}>
                        {employee.hireDate || "-"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Status
                      </label>
                      <p>
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${employee.active
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-800"
                            }`}
                        >
                          {employee.active ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div
                  className={`rounded-2xl p-5 sm:p-6 border ${isDark
                      ? "bg-gradient-to-br from-slate-900 to-emerald-950 border-emerald-900/50"
                      : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
                    }`}
                >
                  <h3 className={headingClass}>
                    <svg
                      className={`w-5 h-5 ${isDark ? "text-emerald-300" : "text-emerald-600"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>
                        Date of Birth
                      </label>
                      <p className={valueClass}>
                        {employee.dateOfBirth || "-"}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Age
                      </label>
                      <p className={valueClass}>
                        {calculateAge(employee.dateOfBirth)} years
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div
                  className={`rounded-2xl p-5 sm:p-6 border ${isDark
                      ? "bg-gradient-to-br from-slate-900 to-amber-950 border-amber-900/50"
                      : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
                    }`}
                >
                  <h3 className={headingClass}>
                    <svg
                      className={`w-5 h-5 ${isDark ? "text-amber-300" : "text-amber-600"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Financial Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>
                        Salary
                      </label>
                      <p
                        className={`font-bold text-2xl ${isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                      >
                        {getCurrencySymbol(employee.currency || "USD")}{" "}
                        {Number(employee.salary || 0).toLocaleString()}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {employee.currency || "USD"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-4 sm:px-8 py-4 border-t ${isDark
                ? "bg-slate-900 border-slate-700"
                : "bg-slate-50 border-slate-200"
              }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-lg btn-gradient-slate px-4 py-2 font-semibold text-white hover:shadow-lg transition-shadow"
            >
              Close
            </button>
            {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  onEdit(employee);
                  onClose();
                }}
                className="w-full sm:w-auto rounded-lg btn-gradient-orange px-4 py-2 font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                Edit Employee
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAccessDenied(true)}
                className={`w-full sm:w-auto rounded-lg px-4 py-2 font-semibold cursor-not-allowed ${isDark
                    ? "bg-slate-800 border border-slate-600 text-slate-300"
                    : "bg-slate-200 text-slate-400"
                  }`}
              >
                🔒 Contact Admin
              </button>
            )}
          </div>
        </div>
        <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-gradientShift {
          animation: gradientShift 8s ease infinite;
        }
        @media (max-width: 640px) {
          .modal-content {
            height: calc(100dvh - 12px);
            margin-top: 6px;
            border-radius: 20px 20px 0 0;
          }
        }
      `}</style>
      </div>

      <AccessDeniedModal
        isOpen={showAccessDenied}
        onClose={() => setShowAccessDenied(false)}
        theme={theme}
      />
    </>
  );
}
