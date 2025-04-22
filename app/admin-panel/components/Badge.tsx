'use client';

import { cn } from "@/lib/utils";
import { Clock, CheckCircle, Settings, Truck, XCircle } from "lucide-react";
import { ComponentPropsWithoutRef, ElementType, FC } from "react";

interface BadgeProps extends ComponentPropsWithoutRef<"div"> {
    variant?: 'default' | 'destructive' | 'success';
    icon?: ElementType;
    text: string;
  }

export const Badge: FC<BadgeProps> = ({
    variant = 'default',
    icon: Icon,
    text,
    className,
    ...props
  }) => {
    return (
      <div
        className={cn(
          "flex flex-row items-center justify-center gap-4 rounded-full px-2.5 py-0.5 text-sm font-medium",
          variant === 'destructive' && "bg-red-100 p-2 md:p-0 text-red-800",
          variant === 'success' && "bg-green-100 p-2 md:p-0 text-green-800",
          variant === 'default' && "bg-gray-200 p-2 md:p-0 text-gray-800",
          className
        )}
        {...props}
      >
        <span className="text-center">{text}</span>
        {Icon && <Icon className="h-4 w-4" />}
      </div>
    );
  };

export const OrderStatusBadge = ({ status }: { status: string }) => {
  let icon: ElementType | undefined;
  let text: string = '';
  let variant: 'default' | 'destructive' | 'success' = 'default';

  switch (status) {
    case 'pending':
      icon = Clock;
      text = 'قيد الانتظار';
      variant = 'default';
      break;
    case 'confirmed':
      icon = CheckCircle;
      text = 'تم التأكيد';
      variant = 'success';
      break;
    case 'processing':
      icon = Settings;
      text = 'قيد التجهيز';
      variant = 'default';
      break;
    case 'delivered':
      icon = Truck;
      text = 'تم التوصيل';
      variant = 'success';
      break;
    case 'declined':
      icon = XCircle;
      text = 'تم الرفض';
      variant = 'destructive';
      break;
    default:
      text = 'غير معروف';
      variant = 'default';
      break;
  }

  return (
    <Badge text={text} icon={icon} variant={variant}/>
  );
};

export default Badge;
