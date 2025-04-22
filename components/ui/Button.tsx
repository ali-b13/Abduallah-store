import React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const buttonVariants = cva(
  '  rounded-md text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group',
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-white border border-primary/20',
          'hover:before:opacity-100 hover:before:translate-x-0',
          'before:absolute before:inset-0 before:-z-[1]',
          'before:bg-[linear-gradient(95deg,transparent_15%,rgba(255,255,255,0.25)_45%,transparent_85%)]',
          'before:opacity-0 before:translate-x-full before:transition-all before:duration-500'
        ],
        secondary: 'bg-secondary text-white hover:bg-secondary/80',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 rounded-md',
        default: 'h-10 py-2 px-4',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, href, children, ...props }, ref) => {
    
    const baseClasses = buttonVariants({ variant, size, className });
    
    if (href) {
      return (
        <Link
          href={href}
          className={clsx(baseClasses, className)}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          <span className="relative z-10">{children}</span>
        </Link>
      );
    }

    return (
      <button
        className={clsx(baseClasses, className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };