import React from "react";
import useLockBodyScroll from "../hooks/useLockBodyScroll.js";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  theme = "light",
}) {
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className={`max-w-md w-full rounded-xl shadow-2xl transform animate-scaleIn border ${
          isDark
            ? "bg-slate-900 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="p-6">
          <h3
            className={`mb-2 text-xl font-bold ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            {title}
          </h3>
          <p className={isDark ? "text-slate-300" : "text-slate-600"}>{message}</p>
        </div>
        <div
          className={`flex items-center justify-end gap-3 px-6 py-4 rounded-b-xl border-t ${
            isDark
              ? "bg-slate-900 border-slate-700"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg btn-gradient-slate px-4 py-2 font-semibold text-white hover:shadow-lg transition-shadow"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg btn-gradient-red px-4 py-2 font-semibold text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            Delete
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
