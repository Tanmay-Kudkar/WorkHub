import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
const HEALTH_CHECK_URL = `${API_BASE}/api/health`;

const ServerStateContext = createContext({
  isWakingUp: false,
  isBackendReady: false,
  isServerLive: false,
  triggerServerWakeup: () => {},
  simulateWakeup: () => {},
  onProgressReachedHundred: () => {},
});

export const useServerState = () => useContext(ServerStateContext);

export const ServerStateProvider = ({ children }) => {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isServerLive, setIsServerLive] = useState(false);
  
  const isWakingUpRef = useRef(false);
  const pendingRequestsQueueRef = useRef([]);
  const pollTimerRef = useRef(null);
  const lastActiveTimeRef = useRef(Date.now());

  // Synchronize ref with state
  useEffect(() => {
    isWakingUpRef.current = isWakingUp;
  }, [isWakingUp]);

  // Replay all queued requests once server completes wakeup flow
  const processPendingQueue = useCallback(() => {
    const queue = pendingRequestsQueueRef.current;
    pendingRequestsQueueRef.current = [];
    queue.forEach(({ resolve, retry }) => {
      resolve(retry());
    });
  }, []);

  // Called when 0-100% progress bar reaches 100%
  const onProgressReachedHundred = useCallback(() => {
    setIsServerLive(true);

    // Display the Green Tick drawn animation & live success screen for 3.4 seconds so user can read it comfortably
    setTimeout(() => {
      setIsWakingUp(false);
      isWakingUpRef.current = false;
      setIsBackendReady(false);
      setIsServerLive(false);
      processPendingQueue();
    }, 3400);
  }, [processPendingQueue]);

  // Polling function: checks /api/health every 500ms when waking up
  const startPollingBackend = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const res = await window.fetch(HEALTH_CHECK_URL, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          // Server responds 200 OK! Stop polling & mark backend ready
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }

          setIsBackendReady(true);
        }
      } catch (_) {
        // Backend still down/waking up. Keep polling every 500ms
      }
    };

    // Run immediate check, then schedule 500ms interval
    checkHealth();
    pollTimerRef.current = setInterval(checkHealth, 500);
  }, []);

  // Trigger wakeup screen and start polling
  const triggerServerWakeup = useCallback(() => {
    if (isWakingUpRef.current) return;
    isWakingUpRef.current = true;
    setIsWakingUp(true);
    setIsBackendReady(false);
    setIsServerLive(false);
    startPollingBackend();
  }, [startPollingBackend]);

  // Method to manually simulate wakeup for UI testing
  const simulateWakeup = useCallback(() => {
    isWakingUpRef.current = true;
    setIsWakingUp(true);
    setIsBackendReady(false);
    setIsServerLive(false);
    startPollingBackend();
  }, [startPollingBackend]);

  // On initial app load, perform immediate health check on landing page
  useEffect(() => {
    const checkInitialHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await window.fetch(HEALTH_CHECK_URL, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          triggerServerWakeup();
        }
      } catch (_) {
        triggerServerWakeup();
      }
    };

    checkInitialHealth();
  }, [triggerServerWakeup]);

  // Continuous background health check heartbeat (every 8 seconds)
  useEffect(() => {
    const heartbeatTimer = setInterval(async () => {
      // Only ping when wakeup screen is not already active
      if (isWakingUpRef.current) return;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await window.fetch(HEALTH_CHECK_URL, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok && !isWakingUpRef.current) {
          triggerServerWakeup();
        }
      } catch (_) {
        if (!isWakingUpRef.current) {
          triggerServerWakeup();
        }
      }
    }, 8000);

    return () => clearInterval(heartbeatTimer);
  }, [triggerServerWakeup]);

  // Global window.fetch interceptor
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const [input] = args;
      const urlString = typeof input === "string" ? input : input?.url || "";

      // Bypass health check endpoints from being intercepted into recursive queues
      if (urlString.includes("/api/health")) {
        return originalFetch(...args);
      }

      try {
        const response = await originalFetch(...args);

        // Catch Gateway Timeout / Cold Start (502, 503, 504, 522). In local dev, Vite proxy ECONNREFUSED is 500.
        const isColdStartError = [502, 503, 504, 522].includes(response.status) || 
                                 (import.meta.env.DEV && response.status === 500);

        if (isColdStartError) {
          triggerServerWakeup();

          return new Promise((resolve) => {
            pendingRequestsQueueRef.current.push({
              resolve,
              retry: () => window.fetch(...args),
            });
          });
        }

        return response;
      } catch (error) {
        // Network error (e.g. server sleeping / shutdown / dropped connection / ECONNREFUSED)
        triggerServerWakeup();

        return new Promise((resolve) => {
          pendingRequestsQueueRef.current.push({
            resolve,
            retry: () => window.fetch(...args),
          });
        });
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [triggerServerWakeup]);

  // Prolonged inactivity & user activity listeners for backend sleep handling
  useEffect(() => {
    const checkServerIfIdle = async () => {
      const elapsedMinutes = (Date.now() - lastActiveTimeRef.current) / (1000 * 60);
      if (elapsedMinutes >= 5 && !isWakingUpRef.current) {
        lastActiveTimeRef.current = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const res = await window.fetch(HEALTH_CHECK_URL, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            triggerServerWakeup();
          }
        } catch (_) {
          triggerServerWakeup();
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        lastActiveTimeRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        checkServerIfIdle();
      }
    };

    const handleUserInteraction = () => {
      const elapsedMinutes = (Date.now() - lastActiveTimeRef.current) / (1000 * 60);
      if (elapsedMinutes >= 10) {
        checkServerIfIdle();
      } else {
        lastActiveTimeRef.current = Date.now();
      }
    };

    const handleOnline = async () => {
      try {
        const res = await window.fetch(HEALTH_CHECK_URL, { method: "GET", cache: "no-store" });
        if (!res.ok) triggerServerWakeup();
      } catch (_) {
        triggerServerWakeup();
      }
    };

    const handlePageShow = (event) => {
      // If page is restored from bfcache, force clear the wakeup screen to prevent it from being stuck
      if (event.persisted) {
        isWakingUpRef.current = false;
        setIsWakingUp(false);
        setIsBackendReady(false);
        setIsServerLive(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("mousemove", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", handleUserInteraction, { passive: true });
    window.addEventListener("touchstart", handleUserInteraction, { passive: true });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("mousemove", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
    };
  }, [triggerServerWakeup]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  return (
    <ServerStateContext.Provider
      value={{
        isWakingUp,
        isBackendReady,
        isServerLive,
        triggerServerWakeup,
        simulateWakeup,
        onProgressReachedHundred,
      }}
    >
      {children}
    </ServerStateContext.Provider>
  );
};
