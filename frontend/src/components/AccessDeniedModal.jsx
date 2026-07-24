import React from "react";
import useLockBodyScroll from "../hooks/useLockBodyScroll.js";

export default function AccessDeniedModal({
  isOpen,
  onClose,
  theme = "light",
}) {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className={`max-w-md w-full rounded-2xl shadow-2xl transform animate-scaleIn border ${
          isDark
            ? "bg-slate-900 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
            <svg
              className="w-8 h-8 text-white"
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
          </div>
          <h3
            className={`mb-2 text-center text-2xl font-bold ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Access Restricted
          </h3>
          <p className={`mb-6 text-center ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Only administrators can edit other employees. Please contact your
            admin for assistance.
          </p>
        </div>
        <div
          className={`flex items-center justify-center px-6 py-4 rounded-b-2xl border-t ${
            isDark
              ? "bg-slate-900 border-slate-700"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg btn-gradient-blue px-6 py-2.5 font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            Got it
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
