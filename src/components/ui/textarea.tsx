import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-700 transition-colors",
          "placeholder:text-slate-400 focus:border-[#94C6EF] focus:outline-none focus:ring-2 focus:ring-[#94C6EF]/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-[#94C6EF] dark:focus:ring-[#94C6EF]/30",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
