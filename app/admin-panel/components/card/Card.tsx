'use client';

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";

 const Card = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-white shadow-sm", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export default Card