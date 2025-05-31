import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded border-2 border-slate-300 bg-white transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-[#94C6EF]/20 focus:ring-offset-0 focus:border-[#94C6EF]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-[#94C6EF] data-[state=checked]:border-[#94C6EF] data-[state=checked]:text-white",
      "dark:border-slate-600 dark:bg-slate-800 dark:focus:border-[#94C6EF] dark:focus:ring-[#94C6EF]/30",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
