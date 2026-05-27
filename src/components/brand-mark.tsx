import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
import brandLogo from "@/app/Big_C_mini_logo.ico";

interface BrandMarkProps {
  size?: number;
  inverse?: boolean;
  className?: string;
}

export function BrandMark({ size = 28, inverse = false, className }: BrandMarkProps) {
  return (
    <Image
      src={brandLogo}
      alt="Mini BigC"
      width={size}
      height={size}
      className={cn(
        "shrink-0 object-contain",
        inverse && "rounded-md bg-white/95 p-0.5 shadow-sm ring-1 ring-inset ring-white/20",
        className,
      )}
      style={{ width: size, height: size }}
      priority
    />
  );
}
