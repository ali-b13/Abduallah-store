'use client';

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

const Button = forwardRef<
  ElementRef<"button">,
  ComponentPropsWithoutRef<"button"> & { 
    variant?: 'default' | 'success' | 'destructive' | 'outline' 
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      
      // Default variant
      variant === 'default' && "bg-gray-900 text-white hover:bg-gray-800",
      
      // Success variant
      variant === 'success' && "bg-green-600 text-white hover:bg-green-700",
      
      // Destructive variant
      variant === 'destructive' && "bg-red-600 text-white hover:bg-red-700",
      
      // Outline variant
      variant === 'outline' && [
        "border border-gray-300 bg-white text-slate-900",
        "hover:bg-gray-100 hover:text-gray-900",
        "dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      ],
      
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";

export default Button;