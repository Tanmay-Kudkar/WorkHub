import React, { useEffect, useState } from "react";
import {
  createEmployee,
  listDepartments,
  listJobTitles,
  updateEmployee,
} from "../services/api.js";
import NeonSweepButton from "./NeonSweepButton.jsx";

const empty = {
  firstName: "",
  lastName: "",
  email: "",
  profileImage: "",
  phone: "",
  phoneCountryCode: "+1",
  departmentId: "",
  jobTitleId: "",
  address: "",
  salary: "",
  currency: "USD",
  dateOfBirth: "",
  hireDate: "",
  active: true,
  password: "",
};

export default function EmployeeForm({ selected, onSaved, currentUser, theme = "light" }) {
  const [form, setForm] = useState(empty);
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false); // Add a local state for showing the error toast/modal
  const isDark = theme === "dark";

  useEffect(() => {
    if (selected) {
      setForm({
        id: selected.id,
        firstName: selected.firstName || "",
        lastName: selected.lastName || "",
        email: selected.email || "",
        profileImage: selected.profileImage || "",
        phone: selected.phone || "",
        phoneCountryCode: selected.phoneCountryCode || "+1",
        departmentId:
          selected.departmentId != null ? String(selected.departmentId) : "",
        jobTitleId:
          selected.jobTitleId != null ? String(selected.jobTitleId) : "",
        address: selected.address || "",
        salary: selected.salary ?? "",
        currency: selected.currency || "USD",
        dateOfBirth: selected.dateOfBirth || "",
        hireDate: selected.hireDate || "",
        active: !!selected.active,
        password: "",
      });
    } else {
      setForm(empty);
    }
  }, [selected]);

  const onPhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Simple client-side guard to avoid huge payloads.
    const maxBytes = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxBytes) {
      setError("Please select an image smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((f) => ({ ...f, profileImage: result }));
    };
    reader.onerror = () => setError("Failed to read the selected image.");
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([listDepartments(), listJobTitles()])
      .then(([deptRows, titleRows]) => {
        if (!mounted) return;
        setDepartments(deptRows || []);
        setJobTitles(titleRows || []);
      })
      .catch(() => {
        if (!mounted) return;
        setDepartments([]);
        setJobTitles([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (error) {
      setShowErrorToast(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => setShowErrorToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const startTime = Date.now();

      const payload = {
        ...form,
        departmentId:
          form.departmentId === "" ? null : Number(form.departmentId),
        jobTitleId: form.jobTitleId === "" ? null : Number(form.jobTitleId),
        salary: form.salary === "" ? null : Number(form.salary),
        currency: form.currency || "USD",
      };
      if (!form.id && !form.password)
        throw new Error("Password is required for new employees");
      if (!form.password) delete payload.password;

      if (form.id) {
        await updateEmployee(form.id, payload, currentUser);
      } else {
        await createEmployee(payload);
      }

      // Show saving animation for at least 800ms
      const elapsedTime = Date.now() - startTime;
      const minSaveTime = 800;
      if (elapsedTime < minSaveTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minSaveTime - elapsedTime)
        );
      }

      setForm(empty);
      onSaved && onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!form.id;
  const initials = `${(form.firstName || "").trim().slice(0, 1)}${(form.lastName || "").trim().slice(0, 1)}`
    .toUpperCase() || "U";

  const labelClass = `block text-sm font-medium mb-1 ${isDark ? "text-slate-200" : "text-slate-700"}`;
  const baseFieldClass = "rounded-lg border px-3 py-2 outline-none transition";
  const inputClass = `w-full ${baseFieldClass} ${isDark
    ? "border-slate-700 bg-slate-900/60 text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
    : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    }`;
  const selectFullClass = `w-full ${baseFieldClass} ${isDark
    ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
    : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    }`;
  const selectCompactClass = `w-24 ${baseFieldClass} ${isDark
    ? "border-slate-700 bg-slate-900/60 text-slate-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
    : "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    }`;
  const disabledInputClass = `w-full ${baseFieldClass} ${isDark
    ? "border-slate-700 bg-slate-800/70 text-slate-400 cursor-not-allowed"
    : "border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
    }`;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-6 mb-6 animate-fade-in-up relative ${isDark
        ? "bg-slate-900/95 border-slate-700 shadow-[0_22px_44px_rgba(2,6,23,0.4)]"
        : "bg-white border-slate-200 shadow-md"
        }`}
    >
      {isDark && (
        <style>{`
          .wh-date-input { color-scheme: dark; }
          .wh-date-input::-webkit-calendar-picker-indicator {
            filter: invert(1) brightness(1.7) contrast(1.2) !important;
            opacity: 1 !important;
          }
        `}</style>
      )}
      <h2 className={`mb-4 text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
        {form.id ? "Edit Employee" : "Add Employee"}
      </h2>
      {/* Interactive error toast/modal */}
      {showErrorToast && error && (
        <div className="fixed left-1/2 top-6 z-50 transform -translate-x-1/2 animate-fade-in-up">
          <div className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl shadow-lg border border-red-600">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-1.414-1.414A9 9 0 105.636 18.364l1.414-1.414A7 7 0 1116.95 7.05z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01"
              />
            </svg>
            <span className="font-semibold">{error}</span>
            <NeonSweepButton
              type="button"
              unstyled
              onClick={() => setShowErrorToast(false)}
              className="ml-3 text-white/80 hover:text-white focus:outline-none"
              aria-label="Dismiss"
            >
              <svg
                className="w-4 h-4"
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
            </NeonSweepButton>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit}>
        {/* Overlay during save */}
        {saving && (
          <div
            className={`absolute inset-0 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm ${isDark ? "bg-slate-950/75" : "bg-white/80"
              }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${isDark ? "border-cyan-400" : "border-blue-600"
                  }`}
              ></div>
              <p className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Saving...
              </p>
            </div>
          </div>
        )}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg border overflow-hidden ${isDark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-100 border-slate-200 text-slate-900"}`}
          >
            {form.profileImage ? (
              <img
                src={form.profileImage}
                alt="Employee profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="flex-1">
            <label
              htmlFor="employee-profileImage"
              className={labelClass}
            >
              Profile photo
            </label>
            <input
              id="employee-profileImage"
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none transition file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-semibold ${isDark
                ? "border-slate-700 bg-slate-900/60 text-slate-100 file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
                : "border-slate-300 bg-white text-slate-900 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                }`}
            />
            <p className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              PNG/JPG recommended (max 2MB)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="employee-firstName"
              className={labelClass}
            >
              First name *
            </label>
            <input
              id="employee-firstName"
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={onChange}
              required
              autoComplete="given-name"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="employee-lastName"
              className={labelClass}
            >
              Last name *
            </label>
            <input
              id="employee-lastName"
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={onChange}
              required
              autoComplete="family-name"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="employee-email"
              className={labelClass}
            >
              Email *
            </label>
            <input
              id="employee-email"
              name="email"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              autoComplete="email"
              disabled={isEdit}
              className={isEdit ? disabledInputClass : inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="employee-phoneCountryCode"
              className={labelClass}
            >
              Phone
            </label>
            <div className="flex gap-2">
              <select
                id="employee-phoneCountryCode"
                name="phoneCountryCode"
                value={form.phoneCountryCode}
                onChange={onChange}
                aria-label="Country code"
                className={`${selectCompactClass} px-2 text-sm`}
              >
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (IN)</option>
                <option value="+86">+86 (CN)</option>
                <option value="+81">+81 (JP)</option>
                <option value="+49">+49 (DE)</option>
                <option value="+33">+33 (FR)</option>
                <option value="+39">+39 (IT)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+7">+7 (RU)</option>
                <option value="+82">+82 (KR)</option>
                <option value="+55">+55 (BR)</option>
                <option value="+52">+52 (MX)</option>
                <option value="+34">+34 (ES)</option>
                <option value="+31">+31 (NL)</option>
                <option value="+46">+46 (SE)</option>
                <option value="+41">+41 (CH)</option>
                <option value="+64">+64 (NZ)</option>
                <option value="+65">+65 (SG)</option>
                <option value="+971">+971 (AE)</option>
              </select>
              <input
                id="employee-phone"
                name="phone"
                placeholder="Phone number"
                type="tel"
                value={form.phone}
                onChange={onChange}
                autoComplete="tel"
                aria-describedby="employee-phoneCountryCode"
                className={`flex-1 ${inputClass}`}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="employee-departmentId"
              className={labelClass}
            >
              Department
            </label>
            <select
              id="employee-departmentId"
              name="departmentId"
              value={form.departmentId}
              onChange={onChange}
              className={selectFullClass}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="employee-jobTitleId"
              className={labelClass}
            >
              Job Title
            </label>
            <select
              id="employee-jobTitleId"
              name="jobTitleId"
              value={form.jobTitleId}
              onChange={onChange}
              className={selectFullClass}
            >
              <option value="">Select job title</option>
              {jobTitles.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="employee-address"
              className={labelClass}
            >
              Address
            </label>
            <input
              id="employee-address"
              name="address"
              placeholder="Full address"
              value={form.address}
              onChange={onChange}
              autoComplete="street-address"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="employee-salary"
              className={labelClass}
            >
              Salary
            </label>
            <div className="flex gap-2">
              <select
                id="employee-currency"
                name="currency"
                value={form.currency}
                onChange={onChange}
                aria-label="Currency"
                className={selectCompactClass}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="JPY">JPY</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY</option>
                <option value="SEK">SEK</option>
                <option value="NZD">NZD</option>
              </select>
              <input
                id="employee-salary"
                name="salary"
                placeholder="Amount"
                type="number"
                step="0.01"
                value={form.salary}
                onChange={onChange}
                aria-describedby="employee-currency"
                className={`flex-1 ${inputClass}`}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="employee-dateOfBirth"
              className={labelClass}
            >
              Date of Birth
            </label>
            <input
              id="employee-dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={onChange}
              autoComplete="bday"
              className={`${inputClass} wh-date-input`}
              style={{ colorScheme: isDark ? "dark" : "light" }}
            />
          </div>
          <div>
            <label
              htmlFor="employee-hireDate"
              className={labelClass}
            >
              Hire date
            </label>
            <input
              id="employee-hireDate"
              name="hireDate"
              type="date"
              value={form.hireDate}
              onChange={onChange}
              className={`${inputClass} wh-date-input`}
              style={{ colorScheme: isDark ? "dark" : "light" }}
            />
          </div>
          <div>
            <label
              htmlFor="employee-password"
              className={labelClass}
            >
              Password {form.id && "(optional)"}
            </label>
            <div className="relative">
              <input
                id="employee-password"
                name="password"
                placeholder={form.id ? "New password" : "Password"}
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                autoComplete={form.id ? "new-password" : "new-password"}
                className={`${inputClass} pr-10`}
              />
              <NeonSweepButton
                type="button"
                unstyled
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${isDark ? "text-slate-300 hover:text-slate-100" : "text-slate-400 hover:text-slate-600"}`}
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </NeonSweepButton>
            </div>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span
                className={`relative inline-block w-5 h-5 rounded border transition-colors duration-200 ${form.active
                  ? "bg-blue-600 border-blue-600"
                  : isDark
                    ? "bg-slate-900 border-slate-600"
                    : "bg-white border-slate-300"
                  }`}
                tabIndex={0}
                role="checkbox"
                aria-checked={form.active}
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    setForm((f) => ({ ...f, active: !f.active }));
                  }
                }}
              >
                {form.active && (
                  <svg
                    className="absolute left-0 top-0 w-5 h-5 text-white pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Active</span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <NeonSweepButton
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto rounded-lg btn-gradient-orange px-6 py-2.5 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-shadow"
          >
            {saving ? "Saving..." : "Save"}
          </NeonSweepButton>
          {form.id && (
            <NeonSweepButton
              type="button"
              onClick={() => setForm(empty)}
              className="w-full sm:w-auto rounded-lg btn-gradient-violet px-6 py-2.5 font-semibold text-white hover:shadow-lg transition-shadow"
            >
              Cancel
            </NeonSweepButton>
          )}
        </div>
      </form>
    </div>
  );
}
