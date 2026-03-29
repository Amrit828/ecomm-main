import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary"
  size?: "sm" | "md" | "lg" | "icon"
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-green-600 focus-visible:outline-offset-2"

    const variants = {
      default: "bg-green-600 hover:bg-green-700 text-white shadow-sm active:scale-[0.98]",
      outline: "border border-gray-300 dark:border-white/20 bg-white dark:bg-transparent text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm active:scale-[0.98]",
      ghost: "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-slate-200 active:scale-[0.98]",
      danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm active:scale-[0.98]",
      secondary: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800 active:scale-[0.98]",
    }

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8",
      md: "text-sm px-4 py-2 h-9",
      lg: "text-sm px-6 py-2.5 h-11",
      icon: "h-9 w-9 p-0",
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
