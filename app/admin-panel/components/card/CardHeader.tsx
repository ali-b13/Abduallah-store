'use client';

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";


  const CardHeader =forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-b px-6 py-4", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export default CardHeader