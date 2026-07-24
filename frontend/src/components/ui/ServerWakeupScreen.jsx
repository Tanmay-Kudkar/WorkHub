import React, { useEffect, useState, useRef } from "react";
import { useServerState } from "../../context/ServerStateContext.jsx";
import useLockBodyScroll from "../../hooks/useLockBodyScroll.js";

const WAKEUP_MESSAGES = [
  "Waking up cloud server...",
  "Render free-tier instance cold start in progress...",
  "Restoring backend services & database pools...",
  "Establishing secure live connection...",
];

export default function ServerWakeupScreen() {
  const { isWakingUp, isBackendReady, isServerLive, onProgressReachedHundred } = useServerState();
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasTriggeredFinishedRef = useRef(false);

  // Lock background body scroll whenever the server wakeup overlay is active
  useLockBodyScroll(isWakingUp);

  // Instantly reset progress to 0 when screen is closed or when starting fresh
  useEffect(() => {
    if (!isWakingUp || (!isBackendReady && !isServerLive)) {
      if (!isBackendReady) {
        setProgress(0);
      }
      hasTriggeredFinishedRef.current = false;
    }
  }, [isWakingUp, isBackendReady, isServerLive]);

  // Rotate professional messaging every 3.5 seconds while waking up
  useEffect(() => {
    if (!isWakingUp || isServerLive) return;

    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % WAKEUP_MESSAGES.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isWakingUp, isServerLive]);

  // Progress Bar Logic (0% to 100% smooth, fluid progress)
  useEffect(() => {
    if (!isWakingUp || isServerLive) return;

    let timer;

    if (isBackendReady) {
      // Server is live! Slowly & visibly fill progress bar to 100% over ~2.0 seconds
      const stepTime = 40; // 40ms per step
      const totalSteps = 50; // 50 steps = 2000ms (2.0s) steady fill duration
      let currentStep = 0;
      const startProgress = progress;
      const progressRemaining = 100 - startProgress;

      timer = setInterval(() => {
        currentStep++;
        const nextProgress = Math.min(100, startProgress + (progressRemaining * (currentStep / totalSteps)));
        setProgress(nextProgress);

        if (currentStep >= totalSteps || nextProgress >= 100) {
          clearInterval(timer);
          setProgress(100);
        }
      }, stepTime);
    } else {
      // Waiting for server: steady smooth progress 0% -> 95%
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95; // Hold at 95% until server responds

          let delta = 0.55;
          if (prev >= 40 && prev < 75) delta = 0.35;
          if (prev >= 75) delta = 0.15;

          return Math.min(95, prev + delta);
        });
      }, 100);
    }

    return () => clearInterval(timer);
  }, [isWakingUp, isBackendReady, isServerLive]);

  // When progress reaches 100%, wait 800ms on the 100% bar before showing green tick animation
  useEffect(() => {
    if (progress >= 100 && isBackendReady && !isServerLive && !hasTriggeredFinishedRef.current) {
      hasTriggeredFinishedRef.current = true;
      
      const pauseTimer = setTimeout(() => {
        onProgressReachedHundred();
      }, 800);

      return () => clearTimeout(pauseTimer);
    }
  }, [progress, isBackendReady, isServerLive, onProgressReachedHundred]);

  if (!isWakingUp) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-all duration-500 animate-fadeIn select-none">
      {/* Background ambient glowing spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className={`relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900/95 p-7 sm:p-9 shadow-2xl backdrop-blur-2xl text-center text-slate-100 transition-all duration-500 ${
        isServerLive 
          ? "border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)]" 
          : "border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]"
      }`}>

        {!isServerLive ? (
          /* ==================== STATE 1: WAKING UP (0-100% PROGRESS) ==================== */
          <div className="flex flex-col items-center py-1 sm:py-2">
            {/* Animated Server Pulse Icon & Orbital Spinner */}
            <div className="relative flex items-center justify-center mb-6 sm:mb-7">
              {/* Outer pulsing ring */}
              <div className="absolute w-28 h-28 rounded-full border-2 border-cyan-500/30 animate-ping opacity-30" />
              
              {/* Spinning orbital glow */}
              <div className="w-24 h-24 rounded-full border-4 border-t-cyan-400 border-r-cyan-500/30 border-b-blue-500/20 border-l-cyan-500/60 animate-spin" />
              
              {/* Server Icon in center */}
              <div className="absolute flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/95 border border-slate-700/90 text-cyan-400 shadow-xl animate-pulse-glow">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
            </div>

            {/* Main Headline */}
            <h3 className="text-2xl font-bold tracking-tight text-white mb-2 font-display">
              Cloud Server Waking Up
            </h3>

            {/* Rotating Professional Description */}
            <p className="text-sm font-medium text-slate-300 min-h-[38px] flex items-center justify-center px-2 transition-all duration-300">
              {WAKEUP_MESSAGES[messageIndex]}
            </p>

            {/* Colorful Non-Looping 0-100% Progress Bar */}
            <div className="w-full mt-4 mb-2 px-1">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5 px-0.5">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  {progress >= 100
                    ? "Server Connected! 100%"
                    : isBackendReady
                    ? "Server Connected! Completing load..."
                    : "Initializing Instance..."}
                </span>
                <span className="font-mono text-slate-200 text-sm font-bold">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="relative h-4 w-full rounded-full bg-slate-800/90 border border-slate-700/80 p-0.5 overflow-hidden shadow-inner">
                {/* Flowing Multi-Color Gradient Fill Bar (0% -> 100%) */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 via-purple-500 via-pink-500 to-emerald-400 animate-water-gradient shadow-[0_0_15px_rgba(6,182,212,0.8)] relative overflow-hidden"
                  style={{
                    width: `${progress}%`,
                    transition: progress === 0 ? "none" : "width 300ms ease-out",
                  }}
                >
                  {/* Liquid Shimmer Light Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-liquid-shimmer pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Informative Note regarding Render Free Tier */}
            <div className="mt-5 w-full rounded-2xl bg-slate-800/40 border border-slate-700/60 p-4 text-xs text-slate-300 leading-relaxed text-left shadow-sm backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-300">
                  Our backend is hosted on a free-tier cloud instance that spins down during inactivity. It usually takes <strong>15–40 seconds</strong> to initialize. Please keep this tab open.
                </span>
              </div>
            </div>

            {/* 500ms Health Check Status Indicator */}
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <span>Testing health status (every 500ms)...</span>
            </div>
          </div>
        ) : (
          /* ==================== STATE 2: SUCCESS (GREEN TICK DRAWN AT 100%) ==================== */
          <div className="flex flex-col items-center py-6 animate-fadeIn">
            {/* SVG Animated Green Tick Mark (Head-to-Tail Drawn) */}
            <div className="relative flex items-center justify-center mb-6">
              {/* Subtle success pulse background */}
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 blur-md animate-ping opacity-60" />
              
              <svg className="w-24 h-24 text-emerald-400" viewBox="0 0 100 100">
                {/* Outer ring drawn clockwise starting from 12 o'clock top */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="animate-draw-circle text-emerald-500"
                />
                {/* Checkmark drawn head-to-tail from left to right */}
                <path
                  d="M28 52 L43 67 L72 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-draw-check text-emerald-400"
                />
              </svg>
            </div>

            {/* Success Headline */}
            <h3 className="text-2xl font-extrabold tracking-tight text-emerald-300 mb-2 font-display">
              Thanks for waiting, our server is live!
            </h3>

            {/* Subtitle */}
            <p className="text-sm font-medium text-slate-300">
              Restoring your active session seamlessly...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
