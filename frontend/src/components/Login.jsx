import React, { useState, useEffect } from "react";
import { login } from "../services/api.js";
import NeonSweepButton from "./NeonSweepButton.jsx";
import GoogleAuthButton from "./GoogleAuthButton.jsx";

export default function Login({
  onLoggedIn,
  onSwitchToRegister,
  showGoogle = true,
  theme = "light",
  active = true,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastClosing, setToastClosing] = useState(false);

  const isDark = theme === "dark";
  const loginInputClass = isDark
    ? "w-full rounded-2xl border border-slate-600 bg-slate-900/65 px-4 py-3 sm:py-3.5 text-sm sm:text-base text-slate-100 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 placeholder:text-slate-400 font-medium"
    : "w-full rounded-2xl border border-slate-400 bg-white px-4 py-3 sm:py-3.5 text-sm sm:text-base text-slate-900 shadow-[inset_0_1px_1px_rgba(15,23,42,0.05)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200/70 placeholder:text-slate-500 font-medium";
  const loginPasswordClass = isDark
    ? "w-full rounded-2xl border border-slate-600 bg-slate-900/65 px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base text-slate-100 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 placeholder:text-slate-400 font-medium"
    : "w-full rounded-2xl border border-slate-400 bg-white px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base text-slate-900 shadow-[inset_0_1px_1px_rgba(15,23,42,0.05)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-200/70 placeholder:text-slate-500 font-medium";
  const eyeButtonClass = isDark
    ? "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1.5 focus:outline-none"
    : "absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition p-1.5 focus:outline-none";
  const signInButtonClass = isDark
    ? "w-full rounded-2xl !border-blue-300/75 !bg-slate-900/70 px-4 py-3 sm:py-3.5 font-bold !text-blue-100 hover:!text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    : "w-full rounded-2xl !border-blue-600 !bg-white px-4 py-3 sm:py-3.5 font-bold !text-blue-800 hover:!text-white shadow-md disabled:cursor-not-allowed disabled:opacity-60";
  const registerPromptClass = isDark
    ? "text-sm text-slate-300 font-medium tracking-wide"
    : "text-sm text-slate-600 font-semibold tracking-wide";
  const registerButtonClass = isDark
    ? "mt-3.5 min-w-[172px] rounded-full !border-emerald-300/75 !bg-slate-900/70 px-6 py-2 text-[15px] font-bold !text-emerald-200 hover:!text-white"
    : "mt-3.5 min-w-[172px] rounded-full !border-emerald-600 !bg-white px-6 py-2 text-[15px] font-bold !text-emerald-800 hover:!text-white";
  const loginLabelClass = isDark
    ? "mb-1 block text-[13px] font-semibold text-slate-200"
    : "mb-1 block text-[13px] font-semibold text-slate-800";

  useEffect(() => {
    if (!error) {
      setToastVisible(false);
      setToastClosing(false);
      return undefined;
    }

    setToastVisible(true);
    setToastClosing(false);

    const closeTimer = setTimeout(() => {
      setToastClosing(true);
    }, 3200);

    const clearTimer = setTimeout(() => {
      setError(null);
      setToastVisible(false);
      setToastClosing(false);
    }, 3500);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(clearTimer);
    };
  }, [error]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const startTime = Date.now();

      const user = await login(email, password);

      // Show loading for at least 600ms
      const elapsedTime = Date.now() - startTime;
      const minLoadTime = 600;
      if (elapsedTime < minLoadTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadTime - elapsedTime)
        );
      }

      onLoggedIn(user);
    } catch (e) {
      setError(e?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const showRegisterButton =
    error &&
    (error.includes("couldn't find") ||
      error.includes("join us") ||
      error.includes("registered") ||
      error.includes("No account found"));

  const toastBaseClass =
    "fixed top-24 sm:top-28 z-[60] right-4 sm:right-8 !w-auto max-w-[calc(100vw-2rem)] sm:max-w-[360px]";
  const toastMotionClass = toastClosing
    ? "opacity-0 translate-y-1"
    : "opacity-100 translate-y-0";
  const toastCardClass =
    `rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur ${isDark
      ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
      : "border-rose-200 bg-rose-50 text-rose-800"
    }`;

  return (
    <>
      {active && error && toastVisible && (
        <div
          className={`${toastBaseClass} ${toastMotionClass} transition-all duration-300`}
        >
          <div role="alert" className={toastCardClass}>
            <div className="flex items-center justify-between gap-3">
              <p className="leading-snug">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setToastClosing(true);
                  setTimeout(() => {
                    setError(null);
                    setToastVisible(false);
                    setToastClosing(false);
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

            {showRegisterButton && (
              <div className="mt-3">
                <NeonSweepButton
                  type="button"
                  tone="emerald"
                  size="md"
                  onClick={onSwitchToRegister}
                  className={registerButtonClass}
                >
                  Create Account
                </NeonSweepButton>
              </div>
            )}
          </div>
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-[372px] space-y-3.5 sm:space-y-4"
      >
        <div>
          <label
            htmlFor="login-email"
            className={loginLabelClass}
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="username@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            required
            autoComplete="email"
            className={loginInputClass}
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className={loginLabelClass}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              required
              autoComplete="current-password"
              className={loginPasswordClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={eyeButtonClass}
            >
              {showPassword ? (
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
            </button>
          </div>
        </div>
        <NeonSweepButton
          type="submit"
          tone="violet"
          size="lg"
          disabled={loading}
          aria-describedby={loading ? "login-loading" : undefined}
          className={signInButtonClass}
        >
          {loading && (
            <div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            ></div>
          )}
          <span id="login-loading" className="sr-only">
            {loading ? "Signing in, please wait..." : ""}
          </span>
          {loading ? "Signing in..." : "Sign In"}
        </NeonSweepButton>

        <GoogleAuthButton
          mode="login"
          enabled={showGoogle}
          theme={theme}
          onAuthenticated={onLoggedIn}
          onError={(message) => {
            setError(message);
          }}
        />

        <div className="pt-1.5 text-center">
          <p className={registerPromptClass}>
            Don't have an account?
          </p>
          <NeonSweepButton
            type="button"
            tone="emerald"
            size="md"
            onClick={onSwitchToRegister}
            className={registerButtonClass}
          >
            Create Account
          </NeonSweepButton>
        </div>
      </form>
    </>
  );
}
