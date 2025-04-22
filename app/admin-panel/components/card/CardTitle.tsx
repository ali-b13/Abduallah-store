'use client';

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";


 const CardTitle = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"h3">>(
    ({ className, ...props }, ref) => (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold text-gray-800", className)}
        {...props}
      />
    )
  );
  CardTitle.displayName = "CardTitle";

  export default CardTitle