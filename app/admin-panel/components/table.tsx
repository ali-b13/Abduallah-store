'use client';

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const Table = forwardRef<HTMLTableElement, ComponentPropsWithoutRef<"table">>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn("w-full block md:table", className)}
      {...props}
    />
  )
);
Table.displayName = "Table";

export const TableHeader = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<"thead">>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("bg-black text-white hidden md:table-header-group", className)}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

export const TableRow = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<"tr">>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "block md:table-row border-b mb-2 last:border-b-2   odd:bg-gray-100 even:bg-white",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"th">>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn("px-4 py-3 text-sm font-medium bg-gray-800 text-white text-left", className)}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<"tbody">>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("divide-y divide-gray-200 block md:table-row-group", className)}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

export const TableCell = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<"td">>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-4 py-3 text-sm text-gray-700 block md:table-cell",
        "before:content-[attr(data-label)] before:font-medium before:text-gray-700 before:block md:before:hidden",
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
);
TableCell.displayName = "TableCell";
