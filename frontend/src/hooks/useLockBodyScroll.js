import { useEffect } from "react";

export default function useLockBodyScroll(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow === "hidden" ? "" : originalOverflow;
    };
  }, [isLocked]);
}
