import { RefreshCcw, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

type RefreshSpinnerIconProps = LucideProps & {
  spinning?: boolean;
};

/** Refresh glyph with a visible spin while `spinning` is true. */
export function RefreshSpinnerIcon({
  spinning = false,
  className,
  ...props
}: RefreshSpinnerIconProps) {
  return (
    <RefreshCcw
      aria-hidden
      className={cn(
        "origin-center",
        spinning && "animate-refresh-spin",
        className,
      )}
      {...props}
    />
  );
}
