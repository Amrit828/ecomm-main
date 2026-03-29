import * as React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
        "outline-none transition-all duration-150",
        "focus:border-green-500 focus:ring-2 focus:ring-green-500/20",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"
