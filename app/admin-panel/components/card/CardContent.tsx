import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";

 const CardContent = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"td">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export default CardContent