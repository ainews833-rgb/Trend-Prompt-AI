import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ className = "", size = "md", showTagline = false }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Sleek Interface Logo Mark */}
      <div
        className={`flex items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 shadow-xs ${iconSizes[size]}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-white"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-slate-800 dark:text-white ${textSizes[size]}`}>
            TrendPrompt AI
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-slate-500 dark:text-slate-400 tracking-tight mt-0.5">
            See the trend. Get the prompt. Make it yours.
          </span>
        )}
      </div>
    </div>
  );
}
