import { useEffect, useMemo, useState } from "react";
import { getGoogleAuthStartUrl } from "../services/api.js";
import googleIcon from "../../assets/google-icon.svg";

export default function GoogleAuthButton({
  mode = "login",
  enabled = true,
  theme = "light",
  compact = false,
  onError,
}) {
  const [redirecting, setRedirecting] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    // Reset redirecting state when returning to page (e.g. via back button / bfcache)
    const resetRedirectState = () => setRedirecting(false);

    const handlePageShow = () => {
      setRedirecting(false);
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", resetRedirectState);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", resetRedirectState);
    };
  }, []);

  const label = useMemo(() => {
    return mode === "register" ? "Sign up with Google" : "Sign in with Google";
  }, [mode]);

  const startGoogleRedirect = () => {
    try {
      setRedirecting(true);
      sessionStorage.setItem(
        "wh_auth_mode",
        mode === "register" ? "register" : "login"
      );
      window.location.assign(getGoogleAuthStartUrl(mode));
    } catch (err) {
      setRedirecting(false);
      onError?.(err?.message || "Unable to start Google sign-in.");
    }
  };

  if (!enabled) return null;

  return (
    <div className={`${compact ? "pt-1" : "pt-2"} text-center`}>
      <div
        className={`flex items-center gap-3 text-xs font-medium ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <span className={`h-px flex-1 ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
        <span className="whitespace-nowrap">or continue with Google</span>
        <span className={`h-px flex-1 ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
      </div>
      <div className={`${compact ? "mt-2" : "mt-3"} flex items-center justify-center`}>
        <button
          type="button"
          onClick={startGoogleRedirect}
          disabled={redirecting}
          className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl border px-4 ${
            compact ? "py-2.5" : "py-3 sm:py-3.5"
          } text-[15px] sm:text-[16px] font-bold shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
            isDark
              ? "border-slate-600 bg-slate-900/65 text-slate-100 hover:bg-slate-800"
              : "border-slate-400 bg-white text-slate-800 hover:bg-slate-50"
          }`}
        >
          <img
            src={googleIcon}
            alt=""
            aria-hidden="true"
            className="h-5 w-5"
          />
          {redirecting ? "Redirecting..." : label}
        </button>
      </div>
    </div>
  );
}
