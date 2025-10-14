import * as React from "react"
import { cn } from "@/lib/utils" // o "@/lib/utils" según tu estructura

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "info" | "success" | "warning" | "error"
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium transition-colors select-none",
          {
            default: "bg-gray-100 text-gray-800",
            secondary: "bg-gray-200 text-gray-700",
            info: "bg-blue-100 text-blue-800",
            success: "bg-green-100 text-green-800",
            warning: "bg-yellow-100 text-yellow-800",
            error: "bg-red-100 text-red-800",
          }[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"
