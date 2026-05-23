import * as React from "react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  size?: number;
  inverse?: boolean;
  className?: string;
}

export function BrandMark({ size = 28, inverse = false, className }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-primary text-primary-foreground",
        inverse ? "ring-1 ring-inset ring-white/20" : "shadow-sm",
        className,
      )}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        aria-hidden
      >
        <path
          d="M5 7h14l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 9V6a3 3 0 0 1 6 0v3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="13.5" r="1.3" fill="currentColor" />
      </svg>
    </div>
  );
}
