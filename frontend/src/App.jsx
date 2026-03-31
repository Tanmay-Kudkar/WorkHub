import { useCallback, useEffect, useRef, useState } from "react";
import EmployeeForm from "./components/EmployeeForm.jsx";
import EmployeeList from "./components/EmployeeList.jsx";
import EmployeeReferencePanel from "./components/EmployeeReferencePanel.jsx";
import Login from "./components/Login.jsx";
import LandingPage from "./components/LandingPage.jsx";
import NeonSweepButton from "./components/NeonSweepButton.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import GoogleAuthButton from "./components/GoogleAuthButton.jsx";
import { exchangeGoogleAuthToken } from "./services/api.js";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

// Use env API base (e.g. http://localhost:3000). Falls back to relative.
const API_BASE = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
const AUTH_MODE_KEY = "wh_auth_mode";

// Format date as DD/MM/YYYY
const formatDateDDMMYYYY = (date) => {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// A minimal inline Register form with cleaner styling
function Register({
  onRegistered,
  onSwitch,
  showGoogle = true,
  theme = "light",
  sharedError,
  setSharedError,
  active = true,
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastClosing, setToastClosing] = useState(false);

  const isDark = theme === "dark";
  const registerLabelClass = isDark
    ? "block text-sm font-medium text-slate-200 mb-0.5"
    : "block text-sm font-semibold text-slate-800 mb-0.5";
  const registerInputClass = isDark
    ? "w-full rounded-2xl border border-slate-600 bg-slate-900/65 px-4 py-2 text-slate-100 placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 transition"
    : "w-full rounded-2xl border border-slate-400 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition";
  const registerPasswordInputClass = isDark
    ? "w-full rounded-2xl border border-slate-600 bg-slate-900/65 px-4 py-2 pr-10 text-slate-100 placeholder:text-slate-400 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/25 transition"
    : "w-full rounded-2xl border border-slate-400 bg-white px-4 py-2 pr-10 text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition";
  const registerToggleClass = isDark
    ? "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
    : "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition";
  const registerHintClass = isDark
    ? "mt-0.5 text-[11px] text-slate-400"
    : "mt-0.5 text-[11px] text-slate-600";
  const registerPrimaryButtonClass = isDark
    ? "flex-1 rounded-2xl !border-blue-300/70 !bg-slate-900/70 px-4 py-2 font-semibold !text-blue-100 hover:!text-white disabled:opacity-60 disabled:cursor-not-allowed"
    : "flex-1 rounded-2xl !border-blue-600 !bg-white px-4 py-2 font-semibold !text-blue-800 hover:!text-white disabled:opacity-60 disabled:cursor-not-allowed";
  const registerSecondaryButtonClass = isDark
    ? "flex-1 rounded-2xl !border-cyan-300/70 !bg-slate-900/70 px-4 py-2 font-semibold !text-cyan-100 hover:!text-white"
    : "flex-1 rounded-2xl !border-cyan-600 !bg-white px-4 py-2 font-semibold !text-cyan-800 hover:!text-white";

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSharedError(null);

    // Enforce minimum password length
    if ((form.password || "").length < 4) {
      setSharedError("Password must be at least 4 characters.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setSharedError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, active: true }),
      });

      if (!res.ok) {
        let errorMsg = "Registration failed";

        try {
          const errorData = await res.json();
          if (errorData?.error) {
            errorMsg = errorData.error;
          } else if (
            res.status === 409 ||
            (errorData?.message &&
              errorData.message.includes("Duplicate entry"))
          ) {
            errorMsg =
              "This email is already registered. Please use a different email or try logging in.";
          }
        } catch (_) {
          // If response is not JSON, check status codes
          if (res.status === 409) {
            errorMsg =
              "This email is already registered. Please use a different email or try logging in.";
          } else if (res.status === 400) {
            errorMsg = "Invalid registration data. Please check your input.";
          }
        }

        throw new Error(errorMsg);
      }

      const user = await res.json();
      onRegistered(user);
    } catch (err) {
      setSharedError(err.message || "Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sharedError) {
      setShowErrorToast(true);
      setToastClosing(false);
      const closeTimer = setTimeout(() => setToastClosing(true), 3200);
      const clearTimer = setTimeout(() => {
        setShowErrorToast(false);
        setToastClosing(false);
        setSharedError(null);
      }, 3500);
      return () => {
        clearTimeout(closeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [sharedError]);

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4 relative">
      <h2 className="text-2xl sm:text-3xl leading-tight font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 text-center">
        Create Account
      </h2>
      {/* Interactive error toast/modal */}
      {active && showErrorToast && sharedError && (
        <div
          className={`fixed top-24 sm:top-28 z-50 left-4 sm:left-8 !w-auto max-w-[calc(100vw-2rem)] sm:max-w-[360px] transition-all duration-300 ${toastClosing ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
        >
          <div
            role="alert"
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur ${isDark
              ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
              : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                <p className="leading-snug">{sharedError}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setToastClosing(true);
                  setTimeout(() => {
                    setShowErrorToast(false);
                    setToastClosing(false);
                    setSharedError(null);
                  }, 200);
                }}
                className={`ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full leading-none transition ${isDark
                  ? "text-rose-200/80 hover:text-rose-100 hover:bg-rose-500/10"
                  : "text-rose-700/80 hover:text-rose-800 hover:bg-rose-200/40"
                  }`}
                aria-label="Dismiss"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="register-firstName"
            className={registerLabelClass}
          >
            First Name
          </label>
          <input
            id="register-firstName"
            name="firstName"
            placeholder="Enter your first name"
            value={form.firstName}
            onChange={onChange}
            required
            autoComplete="given-name"
            className={registerInputClass}
          />
        </div>
        <div>
          <label
            htmlFor="register-lastName"
            className={registerLabelClass}
          >
            Last Name
          </label>
          <input
            id="register-lastName"
            name="lastName"
            placeholder="Enter your last name"
            value={form.lastName}
            onChange={onChange}
            required
            autoComplete="family-name"
            className={registerInputClass}
          />
        </div>
        <div>
          <label
            htmlFor="register-email"
            className={registerLabelClass}
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="yourname@company.com"
            value={form.email}
            onChange={onChange}
            required
            autoComplete="email"
            className={registerInputClass}
          />
        </div>
        <div>
          <label
            htmlFor="register-password"
            className={registerLabelClass}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              required
              minLength={4}
              autoComplete="new-password"
              aria-describedby="password-requirements"
              className={registerPasswordInputClass}
            />
            <NeonSweepButton
              type="button"
              unstyled
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={registerToggleClass}
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
          <p id="password-requirements" className={registerHintClass}>
            Password must be at least 4 characters long
          </p>
        </div>
        <div className="pt-1.5 flex items-center gap-2">
          <NeonSweepButton
            type="submit"
            tone="violet"
            size="md"
            disabled={loading}
            aria-describedby={loading ? "register-loading" : undefined}
            className={registerPrimaryButtonClass}
          >
            <span id="register-loading" className="sr-only">
              {loading ? "Creating account, please wait..." : ""}
            </span>
            {loading ? "Creating account..." : "Register"}
          </NeonSweepButton>
          <NeonSweepButton
            type="button"
            tone="cyan"
            size="md"
            onClick={onSwitch}
            className={registerSecondaryButtonClass}
          >
            Sign In
          </NeonSweepButton>
        </div>

        <GoogleAuthButton
          mode="register"
          enabled={showGoogle}
          theme={theme}
          compact
          onAuthenticated={onRegistered}
          onError={(message) => setSharedError(message)}
        />
      </form>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [uiTheme, setUiTheme] = useState("dark");
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const formRef = useRef(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState("");
  const [googleToastVisible, setGoogleToastVisible] = useState(false);
  const [googleToastClosing, setGoogleToastClosing] = useState(false);
  const [error, setError] = useState(null); // Shared error state for toast/modal
  const [authTransitionLoading, setAuthTransitionLoading] = useState(false);
  const authTransitionTimerRef = useRef(null);
  const navigate = useNavigate();

  // Migrate legacy hash URLs (/#/workspace/...) to BrowserRouter paths (/workspace/...).
  useEffect(() => {
    const h = window.location.hash;
    if (!h) return;

    // Accept both "#/workspace/..." and "#/..." forms.
    if (h.startsWith("#/")) {
      const nextPath = h.slice(1); // remove leading '#'
      navigate(nextPath, { replace: true });
      return;
    }
  }, [navigate]);

  const triggerAuthViewLoading = useCallback(() => {
    if (authTransitionTimerRef.current) {
      window.clearTimeout(authTransitionTimerRef.current);
    }

    if (window.matchMedia("(max-width: 650px)").matches) {
      setAuthTransitionLoading(false);
      return;
    }

    setAuthTransitionLoading(true);
    authTransitionTimerRef.current = window.setTimeout(() => {
      setAuthTransitionLoading(false);
      authTransitionTimerRef.current = null;
    }, 320);
  }, []);

  const onLoggedIn = useCallback((u) => {
    setUser(u);
    localStorage.setItem("wh_user", JSON.stringify(u));
    sessionStorage.removeItem(AUTH_MODE_KEY);
    if (authTransitionTimerRef.current) {
      window.clearTimeout(authTransitionTimerRef.current);
      authTransitionTimerRef.current = null;
    }
    setAuthTransitionLoading(false);
    setGoogleAuthError("");
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("wh_user");
    if (saved) setUser(JSON.parse(saved));

    const savedTheme = localStorage.getItem("wh_theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setUiTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectToken = params.get("google_token");
    const redirectError = params.get("google_error");
    const redirectMode = params.get("google_mode");

    if (!redirectToken && !redirectError) {
      const savedAuthMode = sessionStorage.getItem(AUTH_MODE_KEY);
      if (savedAuthMode === "login" || savedAuthMode === "register") {
        setShowAuthPanel(true);
        setShowRegister(savedAuthMode === "register");
      }
      return;
    }

    setShowAuthPanel(true);
    setShowRegister(redirectMode === "register");

    if (redirectMode === "login" || redirectMode === "register") {
      sessionStorage.setItem(AUTH_MODE_KEY, redirectMode);
    }

    const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);

    if (redirectError) {
      setGoogleAuthError(redirectError);
      setError(redirectError); // Set the shared error state to trigger the UI toast/modal
      return;
    }

    if (!redirectToken) {
      return;
    }

    setGoogleAuthLoading(true);
    exchangeGoogleAuthToken(redirectToken)
      .then((resolvedUser) => {
        onLoggedIn(resolvedUser);
      })
      .catch((err) => {
        setGoogleAuthError(err?.message || "Google sign-in failed.");
      })
      .finally(() => {
        setGoogleAuthLoading(false);
      });
  }, [onLoggedIn, triggerAuthViewLoading]);

  useEffect(() => {
    if (!googleAuthError) {
      setGoogleToastVisible(false);
      setGoogleToastClosing(false);
      return undefined;
    }

    setGoogleToastVisible(true);
    setGoogleToastClosing(false);

    const closeTimer = setTimeout(() => setGoogleToastClosing(true), 3200);
    const clearTimer = setTimeout(() => {
      setGoogleToastVisible(false);
      setGoogleToastClosing(false);
      setGoogleAuthError("");
    }, 3500);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(clearTimer);
    };
  }, [googleAuthError]);

  useEffect(() => {
    return () => {
      if (authTransitionTimerRef.current) {
        window.clearTimeout(authTransitionTimerRef.current);
      }
    };
  }, []);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const closeAuthExperience = () => {
    setShowRegister(false);
    setShowAuthPanel(false);
    setGoogleAuthError("");
    setError(null); // Clear shared error
    setAuthTransitionLoading(false);
    if (authTransitionTimerRef.current) {
      window.clearTimeout(authTransitionTimerRef.current);
      authTransitionTimerRef.current = null;
    }
    sessionStorage.removeItem(AUTH_MODE_KEY);
  };

  const openLoginExperience = () => {
    const shouldAnimateSwitch = showAuthPanel && showRegister;
    setShowRegister(false);
    setShowAuthPanel(true);
    setGoogleAuthError("");
    setError(null); // Clear shared error
    sessionStorage.setItem(AUTH_MODE_KEY, "login");
    if (shouldAnimateSwitch) {
      triggerAuthViewLoading();
    }
  };

  const openRegistrationExperience = () => {
    const shouldAnimateSwitch = showAuthPanel && !showRegister;
    setShowRegister(true);
    setShowAuthPanel(true);
    setGoogleAuthError("");
    setError(null); // Clear shared error
    sessionStorage.setItem(AUTH_MODE_KEY, "register");
    if (shouldAnimateSwitch) {
      triggerAuthViewLoading();
    }
  };

  const logout = () => {
    setUser(null);
    setShowRegister(false);
    setShowAuthPanel(false);
    setGoogleAuthError("");
    setError(null); // Clear shared error
    sessionStorage.removeItem(AUTH_MODE_KEY);
    localStorage.removeItem("wh_user");
  };

  const changeTheme = (nextTheme) => {
    if (nextTheme !== "dark" && nextTheme !== "light") return;
    setUiTheme(nextTheme);
    localStorage.setItem("wh_theme", nextTheme);
  };

  const handleEdit = (employee) => {
    setSelected(employee);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSaved = async () => {
    setSelected(null);
    // Refresh user data if editing own profile
    if (selected?.id === user.id) {
      // Fetch fresh user data from server
      try {
        const params = new URLSearchParams({
          requesterId: String(user.id),
          requesterRole: String(user.role || "USER"),
        });
        const res = await fetch(`${API_BASE}/api/employees/${user.id}?${params.toString()}`);
        if (res.ok) {
          const updatedUser = await res.json();
          setUser(updatedUser);
          localStorage.setItem("wh_user", JSON.stringify(updatedUser));
        }
      } catch (e) {
        console.error("Failed to refresh user data", e);
      }
    }
    // Trigger list refresh
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 safe-pt safe-pb">
      {!user ? (
        showAuthPanel ? (
          <div
            className={`min-h-screen flex flex-col bg-[length:200%_200%] animate-bg-gradient relative overflow-hidden ${uiTheme === "dark"
              ? "bg-gradient-to-br from-[#0b2247] via-[#35216e] to-[#7b234f]"
              : "bg-gradient-to-br from-[#d6eaf5] via-[#efd9e8] to-[#dbe4ff]"
              }`}
          >
            {/* Animated background shapes - optimized for mobile */}
            <div
              className={`absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 rounded-full blur-3xl animate-blob ${uiTheme === "dark" ? "bg-white/10" : "bg-cyan-200/45"
                }`}
            ></div>
            <div
              className={`absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 rounded-full blur-3xl animate-blob animation-delay-2000 ${uiTheme === "dark" ? "bg-white/10" : "bg-pink-200/45"
                }`}
            ></div>
            <div
              className={`absolute bottom-0 left-1/2 w-48 sm:w-96 h-48 sm:h-96 rounded-full blur-3xl animate-blob animation-delay-4000 ${uiTheme === "dark" ? "bg-white/10" : "bg-violet-200/40"
                }`}
            ></div>

            <div className="absolute inset-x-0 top-0 z-20 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeAuthExperience}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-extrabold tracking-[0.02em] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] ${uiTheme === "dark"
                    ? "border-white/40 bg-white/12 text-white hover:bg-white/22"
                    : "border-slate-300 bg-white/90 text-slate-800 hover:bg-white"
                    }`}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to landing
                </button>

                <ThemeToggle
                  theme={uiTheme}
                  onChange={changeTheme}
                  size="sm"
                  className={
                    uiTheme === "dark"
                      ? "border-white/30 bg-black/20"
                      : "border-slate-500/70 bg-white/80"
                  }
                />
              </div>
            </div>

            {googleAuthLoading && (
              <div className="absolute left-1/2 top-20 z-30 -translate-x-1/2 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
                Finishing Google sign-in...
              </div>
            )}

            {/* Main content area - add entrance animation + mobile padding */}
            <div className="flex-1 min-h-0 flex items-center sm:items-stretch justify-center px-4 pb-6 pt-16 sm:px-6 sm:pb-6 sm:pt-24">
              <div
                className={`auth-switch-container relative z-10 ${showRegister ? "is-active" : ""
                  } ${uiTheme === "dark" ? "auth-theme-dark" : "auth-theme-light"} ${authTransitionLoading ? "pointer-events-none" : ""
                  }`}
                aria-busy={authTransitionLoading}
              >
                {googleAuthError && googleToastVisible && (
                  <div
                    className={`fixed top-24 sm:top-28 z-[60] ${showRegister ? "left-4 sm:left-8" : "right-4 sm:right-8"} !w-auto max-w-[calc(100vw-2rem)] sm:max-w-[360px] transition-all duration-300 ${googleToastClosing ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}
                  >
                    <div
                      role="alert"
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur ${uiTheme === "dark"
                        ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
                        : "border-rose-200 bg-rose-50 text-rose-800"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="leading-snug">{googleAuthError}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setGoogleToastClosing(true);
                            setTimeout(() => {
                              setGoogleToastVisible(false);
                              setGoogleToastClosing(false);
                              setGoogleAuthError("");
                            }, 200);
                          }}
                          className={`ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full leading-none transition ${uiTheme === "dark"
                            ? "text-rose-200/80 hover:text-rose-100 hover:bg-rose-500/10"
                            : "text-rose-700/80 hover:text-rose-800 hover:bg-rose-200/40"
                            }`}
                          aria-label="Dismiss"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {authTransitionLoading && (
                  <div
                    className={`absolute inset-0 z-40 overflow-hidden backdrop-blur-sm ${uiTheme === "dark"
                      ? "bg-slate-950/55 text-white"
                      : "bg-white/80 text-slate-700"
                      }`}
                  >
                    <div
                      className={`absolute inset-0 auth-panel-shimmer ${uiTheme === "dark" ? "from-white/0 via-white/20 to-white/0" : "from-blue-50/0 via-blue-200/40 to-blue-50/0"
                        }`}
                    ></div>
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4F46E5] via-[#9333EA] to-[#DB2777]"></div>
                    <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="mx-auto mb-2 flex h-8 items-end justify-center gap-1.5">
                        <span className={`auth-eq-bar h-3 w-1.5 rounded-full ${uiTheme === "dark" ? "bg-cyan-300" : "bg-blue-500"}`} style={{ animationDelay: "0ms" }}></span>
                        <span className={`auth-eq-bar h-6 w-1.5 rounded-full ${uiTheme === "dark" ? "bg-violet-300" : "bg-indigo-500"}`} style={{ animationDelay: "80ms" }}></span>
                        <span className={`auth-eq-bar h-4 w-1.5 rounded-full ${uiTheme === "dark" ? "bg-pink-300" : "bg-fuchsia-500"}`} style={{ animationDelay: "160ms" }}></span>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em]">
                        Switching View
                      </p>
                    </div>
                  </div>
                )}

                <div className="auth-form-panel auth-sign-up">
                  <div className="auth-form-inner">
                    <Register
                      onRegistered={onLoggedIn}
                      onSwitch={openLoginExperience}
                      showGoogle={showRegister}
                      theme={uiTheme}
                      sharedError={error}
                      setSharedError={setError}
                      active={showRegister}
                    />
                  </div>
                </div>

                <div className="auth-form-panel auth-sign-in">
                  <div className="auth-form-inner p-5 sm:p-6">
                    <div className="text-center mb-4 sm:mb-5">
                      <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
                        <span className="text-[#4F46E5]">Work</span>
                        <span className="bg-gradient-to-r from-[#9333EA] to-[#DB2777] bg-clip-text text-transparent">
                          Hub
                        </span>
                      </h1>
                      <p
                        className={`text-sm sm:text-base font-medium ${uiTheme === "dark" ? "text-slate-300" : "text-slate-500"
                          }`}
                      >
                        Employee Management System
                      </p>
                    </div>
                    <Login
                      onLoggedIn={onLoggedIn}
                      onSwitchToRegister={openRegistrationExperience}
                      showGoogle={!showRegister}
                      theme={uiTheme}
                      active={!showRegister}
                    />
                  </div>
                </div>

                <div className="auth-toggle-box">
                  <div className="auth-toggle-panel auth-toggle-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold">Hello, Welcome!</h2>
                    <p className="mt-3 text-sm sm:text-base text-white/90 max-w-xs">
                      Don&apos;t have an account? Register to unlock all WorkHub
                      features.
                    </p>
                    <NeonSweepButton
                      type="button"
                      tone="violet"
                      size="md"
                      onClick={openRegistrationExperience}
                      className="auth-toggle-btn auth-toggle-btn-sweep"
                    >
                      Register
                    </NeonSweepButton>
                  </div>

                  <div className="auth-toggle-panel auth-toggle-right">
                    <h2 className="text-2xl sm:text-3xl font-extrabold">Welcome Back!</h2>
                    <p className="mt-3 text-sm sm:text-base text-white/90 max-w-xs">
                      Already have an account? Sign in and continue where you left
                      off.
                    </p>
                    <NeonSweepButton
                      type="button"
                      tone="cyan"
                      size="md"
                      onClick={openLoginExperience}
                      className="auth-toggle-btn auth-toggle-btn-sweep"
                    >
                      Login
                    </NeonSweepButton>
                  </div>
                </div>
              </div>
            </div>

            <style>{`
            @keyframes bg-gradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes blob {
              0%, 100% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
            }
            @keyframes heartbeat {
              0%, 100% { transform: scale(1); }
              10%, 30% { transform: scale(1.1); }
              20%, 40% { transform: scale(0.95); }
            }
            @keyframes footerFadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes authShimmer {
              0% { transform: translateX(-120%); }
              100% { transform: translateX(120%); }
            }
            @keyframes authEqBar {
              0%, 100% { transform: scaleY(0.55); opacity: 0.55; }
              50% { transform: scaleY(1); opacity: 1; }
            }
            .animate-bg-gradient {
              animation: bg-gradient 15s ease infinite;
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animate-heartbeat {
              animation: heartbeat 1.5s ease-in-out infinite;
            }
            .animate-footerFadeIn {
              animation: footerFadeIn 0.8s ease-out;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
            .auth-panel-shimmer {
              background: linear-gradient(90deg, var(--tw-gradient-stops));
              animation: authShimmer 420ms ease-in-out both;
            }
            .auth-eq-bar {
              transform-origin: bottom center;
              animation: authEqBar 420ms ease-in-out both;
            }
          `}</style>
          </div>
        ) : (
          <LandingPage
            onGetStarted={openLoginExperience}
            onJoinNow={openRegistrationExperience}
            theme={uiTheme}
            onThemeChange={changeTheme}
          />
        )
      ) : (
        <div
          className={`min-h-screen flex flex-col ${uiTheme === "dark" ? "dashboard-theme-dark" : "dashboard-theme-light"
            }`}
        >
          {/* Nav - subtle entrance */}
          <nav
            className={`backdrop-blur-md border-b shadow-lg flex-shrink-0 relative overflow-hidden animate-fade-in-up ${uiTheme === "dark"
              ? "bg-slate-900/90 border-slate-700"
              : "bg-white border-slate-200"
              }`}
          >
            {/* Desktop-only decorative elements */}
            <div className="hidden xl:block absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 relative z-10">
              {/* Mobile-only avatar pinned to top-right */}
              <div className="sm:hidden absolute top-3 right-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg overflow-hidden flex items-center justify-center text-white font-bold">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex w-full items-center justify-between gap-2 sm:gap-4 lg:w-auto lg:justify-start">
                  {/* Desktop enhanced logo */}
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300 hidden lg:block"></div>
                    <div className="relative">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-110 transition-transform duration-300">
                        WorkHub
                      </h1>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-xs sm:text-sm lg:text-base text-slate-500">
                          Employee Management{" "}
                        </p>
                        {user.role === "ADMIN" && (
                          <>
                            {/* Mobile admin badge */}
                            <span className="lg:hidden inline-flex items-center gap-1 px-1 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold">
                              Admin
                            </span>
                            {/* Desktop admin badge */}
                            <span className="hidden lg:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold shadow-lg">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Admin Dashboard
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User info and actions - enhanced for desktop */}
                <div className="flex w-full min-w-0 items-center justify-end gap-2 sm:gap-3 lg:w-auto lg:gap-4 xl:gap-6">
                  <ThemeToggle
                    theme={uiTheme}
                    onChange={changeTheme}
                    size="sm"
                    className={
                      uiTheme === "dark"
                        ? "border-slate-500 bg-black/20"
                        : "border-slate-300 bg-black/15"
                    }
                  />

                  <button
                    type="button"
                    onClick={() => navigate("/workspace/attendance")}
                    className={`rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-extrabold tracking-[0.02em] transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] ${uiTheme === "dark"
                      ? "border-slate-600 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
                      : "border-slate-200 bg-white/90 text-slate-800 hover:bg-white"
                      }`}
                  >
                    Workspace
                  </button>

                  {/* Enhanced desktop time display */}
                  <div
                    className={`hidden xl:flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-sm border shadow-lg ${uiTheme === "dark"
                      ? "bg-slate-900/90 border-slate-700"
                      : "bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-slate-200"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 animate-pulse ${uiTheme === "dark" ? "text-cyan-300" : "text-blue-500"
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                      </svg>
                      <div className="flex flex-col">
                        <span
                          className={`text-lg font-bold tabular-nums animate-timeUpdate ${uiTheme === "dark" ? "text-slate-100" : "text-slate-800"
                            }`}
                        >
                          {currentTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </span>
                        <span
                          className={`text-sm font-medium animate-dateSlide ${uiTheme === "dark" ? "text-slate-300" : "text-slate-500"
                            }`}
                        >
                          {formatDateDDMMYYYY(currentTime)}
                        </span>
                      </div>
                    </div>
                    {/* Desktop-only live indicator */}
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full ${uiTheme === "dark"
                        ? "bg-emerald-500/20"
                        : "bg-green-100"
                        }`}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                      <span
                        className={`text-xs font-medium ${uiTheme === "dark" ? "text-emerald-200" : "text-green-700"
                          }`}
                      >
                        LIVE
                      </span>
                    </div>
                  </div>

                  {/* Mobile/Tablet time display */}
                  <div
                    className={`hidden sm:flex xl:hidden items-center gap-1 px-2 py-1 rounded-md border ${uiTheme === "dark"
                      ? "bg-slate-900/90 border-slate-700"
                      : "bg-slate-100 border-slate-200"
                      }`}
                  >
                    <svg
                      className={`w-3 h-3 ${uiTheme === "dark" ? "text-cyan-300" : "text-slate-500"
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    <span
                      className={`text-xs font-medium tabular-nums ${uiTheme === "dark" ? "text-slate-200" : "text-slate-600"
                        }`}
                    >
                      {currentTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </span>
                  </div>

                  {/* User profile + logout */}
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
                    <div className="hidden sm:block relative group">
                      {/* Desktop/tablet enhanced avatar */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-base shadow-lg cursor-default relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer hidden lg:block"></div>
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt="Profile"
                            className="relative z-10 w-full h-full object-cover"
                          />
                        ) : (
                          <span className="relative z-10">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      {/* Desktop-only status indicator */}
                      <div
                        className={`hidden lg:block absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 rounded-full animate-pulse ${uiTheme === "dark" ? "border-slate-900" : "border-white"
                          }`}
                      ></div>
                    </div>

                    {/* Enhanced desktop user info */}
                    <div className="hidden xl:block text-right min-w-0">
                      <div
                        className={`max-w-[248px] rounded-lg border px-3 py-2 ${uiTheme === "dark"
                          ? "bg-slate-900/90 border-slate-700"
                          : "bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200"
                          }`}
                      >
                        <p
                          className={`flex items-center justify-end gap-2 text-sm lg:text-base font-semibold truncate ${uiTheme === "dark" ? "text-slate-100" : "text-slate-900"
                            }`}
                        >
                          {user.firstName} {user.lastName}
                          {user.role === "ADMIN" && (
                            <span
                              className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"
                              title="Admin User"
                            ></span>
                          )}
                        </p>
                        <p
                          className={`truncate text-xs lg:text-sm ${uiTheme === "dark" ? "text-slate-300" : "text-slate-500"
                            }`}
                        >
                          {user.email}
                        </p>
                        {/* Desktop-only additional info */}
                        <p
                          className={`hidden lg:block mt-1 text-xs ${uiTheme === "dark" ? "text-slate-400" : "text-slate-400"
                            }`}
                        >
                          Last login:{" "}
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "First login"}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced desktop logout button */}
                    <button
                      type="button"
                      onClick={logout}
                      className="group relative shrink-0 min-w-28 sm:min-w-0 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 sm:px-4 lg:px-5 py-2 sm:py-2 lg:py-2.5 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm lg:text-base"
                    >
                      <span className="relative z-10 flex w-full items-center justify-center gap-1 sm:gap-2">
                        <svg
                          className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="lg:text-base">Logout</span>
                      </span>
                      {/* Desktop-only hover effect */}
                      <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop-only bottom gradient */}
            <div className="hidden xl:block absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

            <style>{`
              @keyframes timeUpdate {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.02); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes dateSlide {
                0% { transform: translateX(-2px); opacity: 0.8; }
                100% { transform: translateX(0); opacity: 1; }
              }
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
              .animate-timeUpdate {
                animation: timeUpdate 1s ease-in-out;
              }
              .animate-dateSlide {
                animation: dateSlide 0.3s ease-out;
              }
              .animate-shimmer {
                animation: shimmer 2s ease-in-out infinite;
              }
              .tabular-nums {
                font-variant-numeric: tabular-nums;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
              }
            `}</style>
          </nav>

          {/* Content wrapper - stagger children on mount */}
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full stagger-container">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    {/* Show form only to admin or when user is editing their own profile */}
                    {(user.role === "ADMIN" ||
                      (selected && selected.id === user.id)) && (
                        <div ref={formRef}>
                          <EmployeeForm
                            selected={selected}
                            onSaved={handleSaved}
                            currentUser={user}
                            theme={uiTheme}
                          />
                        </div>
                      )}

                    {/* Show employee list to everyone with conditional buttons */}
                    <EmployeeList
                      onEdit={handleEdit}
                      currentUser={user}
                      refreshKey={refreshKey}
                      theme={uiTheme}
                    />
                  </>
                }
              />

              <Route
                path="/workspace"
                element={<Navigate to="/workspace/attendance" replace />}
              />
              <Route
                path="/workspace/:page"
                element={
                  <EmployeeReferencePanel
                    currentUser={user}
                    theme={uiTheme}
                    mode="page"
                  />
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          {/* Footer - entrance animation */}
          {/* Enhanced desktop footer */}
          <footer
            className={`border-t py-4 sm:py-6 lg:py-8 shadow-inner flex-shrink-0 animate-fade-in-up ${uiTheme === "dark"
              ? "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-slate-700"
              : "bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200"
              }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {/* Desktop enhanced footer */}
              <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      WorkHub
                    </h3>
                    <div className="w-px h-8 bg-slate-300"></div>
                    <p className="text-slate-600">
                      Streamline Your Workforce Management
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="hover:text-blue-600 transition-colors cursor-default">
                      Version 1.0.0
                    </span>
                    <span>•</span>
                    <span className="hover:text-blue-600 transition-colors cursor-default">
                      Built with React & Spring Boot
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      System Online
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-8 mb-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">
                      Product
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Employee Management
                      </li>
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Role-based Access
                      </li>
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Real-time Updates
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">
                      Technology
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        React 18
                      </li>
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Spring Boot 3
                      </li>
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        PostgreSQL 18
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">
                      Deployment
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Render.com Frontend
                      </li>
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Render.com Backend
                      </li>
                      <li className="hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        PostgreSQL Cloud DB
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Team</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="font-semibold text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Tanmay Kudkar
                      </li>
                      <li className="font-semibold text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Atharva Raut
                      </li>
                      <li className="font-semibold text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Sameer Balgar
                      </li>
                      <li className="font-semibold text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Tejas Dhuri
                      </li>
                      <li className="font-semibold text-slate-700 hover:text-blue-600 hover:translate-x-1 transition-all cursor-pointer">
                        Ritikesh Nayak
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet simple footer */}
              <div className="lg:hidden flex flex-col items-center justify-center gap-4 sm:gap-5">
                <div className="text-center animate-slideDown">
                  <h3 className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    WorkHub
                  </h3>
                  <p
                    className={`${uiTheme === "dark" ? "text-slate-300" : "text-slate-500"
                      } text-xs sm:text-sm`}
                  >
                    Streamline Your Workforce Management
                  </p>
                </div>

                {/* Mobile meta row (from desktop footer) */}
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${uiTheme === "dark"
                      ? "border-slate-700 bg-slate-900/60 text-slate-200"
                      : "border-slate-200 bg-white/80 text-slate-700"
                      }`}
                  >
                    Version 1.0.0
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${uiTheme === "dark"
                      ? "border-slate-700 bg-slate-900/60 text-slate-200"
                      : "border-slate-200 bg-white/80 text-slate-700"
                      }`}
                  >
                    Built with React & Spring Boot
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${uiTheme === "dark"
                      ? "border-emerald-900/50 bg-emerald-950/30 text-emerald-200"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                      }`}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    System Online
                  </span>
                </div>

                {/* Divider */}
                <div
                  className={`w-48 sm:w-64 h-px bg-gradient-to-r from-transparent ${uiTheme === "dark" ? "via-slate-700" : "via-slate-300"
                    } to-transparent`}
                ></div>

                {/* Compact feature grid (Product/Technology/Deployment) */}
                <div className="w-full max-w-sm sm:max-w-none grid grid-cols-2 gap-3">
                  <div
                    className={`rounded-2xl border p-4 text-left ${uiTheme === "dark"
                      ? "border-slate-800 bg-slate-950/30"
                      : "border-slate-200 bg-white/70"
                      }`}
                  >
                    <p
                      className={`${uiTheme === "dark" ? "text-slate-100" : "text-slate-900"
                        } text-xs font-black tracking-wide`}
                    >
                      Product
                    </p>
                    <ul
                      className={`${uiTheme === "dark" ? "text-slate-300" : "text-slate-600"
                        } mt-2.5 space-y-1.5 text-[11px]`}
                    >
                      <li>Employee Management</li>
                      <li>Role-based Access</li>
                      <li>Real-time Updates</li>
                    </ul>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 text-left ${uiTheme === "dark"
                      ? "border-slate-800 bg-slate-950/30"
                      : "border-slate-200 bg-white/70"
                      }`}
                  >
                    <p
                      className={`${uiTheme === "dark" ? "text-slate-100" : "text-slate-900"
                        } text-xs font-black tracking-wide`}
                    >
                      Technology
                    </p>
                    <ul
                      className={`${uiTheme === "dark" ? "text-slate-300" : "text-slate-600"
                        } mt-2.5 space-y-1.5 text-[11px]`}
                    >
                      <li>React 18</li>
                      <li>Spring Boot 3</li>
                      <li>PostgreSQL 18</li>
                    </ul>
                  </div>

                  <div
                    className={`col-span-2 rounded-2xl border p-4 text-left ${uiTheme === "dark"
                      ? "border-slate-800 bg-slate-950/30"
                      : "border-slate-200 bg-white/70"
                      }`}
                  >
                    <p
                      className={`${uiTheme === "dark" ? "text-slate-100" : "text-slate-900"
                        } text-xs font-black tracking-wide`}
                    >
                      Deployment
                    </p>
                    <ul
                      className={`${uiTheme === "dark" ? "text-slate-300" : "text-slate-600"
                        } mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]`}
                    >
                      <li>Render.com Frontend</li>
                      <li>Render.com Backend</li>
                      <li className="sm:col-span-2">PostgreSQL Cloud DB</li>
                    </ul>
                  </div>
                </div>

                {/* Team credits - mobile responsive grid */}
                <div className="text-center animate-slideUp">
                  <p
                    className={`${uiTheme === "dark" ? "text-slate-200" : "text-slate-600"
                      } text-xs sm:text-sm mb-3`}
                  >
                    Crafted with{" "}
                    <span className="inline-block animate-heartbeat text-red-500">
                      ❤️
                    </span>{" "}
                    by our amazing team
                  </p>
                  <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-3 sm:max-w-none sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-3">
                    <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[11px] sm:text-sm font-semibold shadow-md cursor-default">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="leading-tight">Tanmay Kudkar</span>
                    </span>

                    <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[11px] sm:text-sm font-semibold shadow-md cursor-default">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="leading-tight">Atharva Raut</span>
                    </span>

                    <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[11px] sm:text-sm font-semibold shadow-md cursor-default">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="leading-tight">Sameer Balgar</span>
                    </span>

                    <span className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 text-white text-[11px] sm:text-sm font-semibold shadow-md cursor-default">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="leading-tight">Tejas Dhuri</span>
                    </span>

                    <span className="col-span-2 inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 text-white text-[11px] sm:text-sm font-semibold shadow-md cursor-default sm:col-span-1">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="leading-tight">Ritikesh Nayak</span>
                    </span>
                  </div>
                </div>
                {/* Copyright */}
                <p
                  className={`${uiTheme === "dark" ? "text-slate-300" : "text-slate-500"
                    } text-xs sm:text-sm animate-fadeIn`}
                >
                  © 2026 WorkHub. All rights reserved.
                </p>
              </div>

              {/* Desktop footer bottom */}
              <div className="hidden lg:flex items-center justify-between pt-6 border-t border-slate-200">
                <p className="text-slate-500 text-sm">
                  © 2026 WorkHub. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="hover:text-blue-600 transition-colors cursor-pointer">
                    Made with ❤️ by the WorkHub Team
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

    </div>
  );
}
