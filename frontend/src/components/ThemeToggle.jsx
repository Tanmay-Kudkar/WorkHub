import clsx from "clsx";

const sizeClasses = {
  sm: "h-9 w-11",
  md: "h-10 w-12",
};

export default function ThemeToggle({
  theme = "dark",
  onChange,
  size = "sm",
  className,
}) {
  const resolvedSize = sizeClasses[size] || sizeClasses.sm;

  const segmentClass = (target) => {
    const active = theme === target;
    return clsx(
      "inline-flex items-center justify-center rounded-xl border font-extrabold uppercase tracking-[0.08em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70",
      resolvedSize,
      active &&
      target === "light" &&
      "bg-white text-slate-900 border-slate-200 shadow-[0_6px_16px_rgba(15,23,42,0.18)]",
      active &&
      target === "dark" &&
      "bg-slate-900 text-white border-slate-700 shadow-[0_6px_16px_rgba(2,6,23,0.35)]",
      !active &&
      theme === "dark" &&
      "bg-white/10 text-white/85 border-white/20 hover:bg-white/20 hover:border-white/35",
      !active &&
      theme === "light" &&
      "bg-slate-200/75 text-slate-600 border-slate-300 hover:bg-white hover:text-slate-800"
    );
  };

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 rounded-2xl border p-1 backdrop-blur-md shadow-[0_12px_26px_rgba(15,23,42,0.16)]",
        theme === "dark"
          ? "border-white/30 bg-black/20"
          : "border-slate-300/90 bg-white/80",  
        className
      )}
    >
      <button
        type="button"
        aria-label="Switch to light theme"
        aria-pressed={theme === "light"}
        onClick={() => onChange?.("light")}
        className={segmentClass("light")}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
        <span className="sr-only">Light</span>
      </button>
      <button
        type="button"
        aria-label="Switch to dark theme"
        aria-pressed={theme === "dark"}
        onClick={() => onChange?.("dark")}
        className={segmentClass("dark")}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
        <span className="sr-only">Dark</span>
      </button>
    </div>
  );
}
