"use client";

import { ButtonHTMLAttributes, ReactNode, useState } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  ripple?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  ripple = true,
  leftIcon,
  rightIcon,
  children,
  className = "",
  onClick,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  const baseStyles =
    "relative overflow-hidden inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-[#E60028] to-[#c90022] text-white shadow-lg shadow-[#E60028]/25 hover:-translate-y-0.5 hover:shadow-[#E60028]/35 focus:ring-[#E60028]/20 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:hover:translate-y-0",
    secondary:
      "border-2 border-[#D9DCE8] bg-white text-black hover:border-black hover:bg-black hover:text-white focus:ring-black/10 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white disabled:hover:text-gray-400",
    ghost:
      "text-black hover:bg-black/[0.06] focus:ring-black/10 disabled:text-gray-400 disabled:hover:bg-transparent",
    danger:
      "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 hover:-translate-y-0.5 hover:shadow-red-600/35 focus:ring-red-600/20 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:hover:translate-y-0",
    success:
      "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/25 hover:-translate-y-0.5 hover:shadow-green-600/35 focus:ring-green-600/20 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:hover:translate-y-0",
  };

  const sizeStyles = {
    xs: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    sm: "px-4 py-2 text-sm rounded-lg gap-2",
    md: "px-5 py-3 text-sm rounded-full gap-2",
    lg: "px-6 py-3.5 text-base rounded-full gap-2.5",
    xl: "px-8 py-4 text-lg rounded-full gap-3",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="mr-1 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {leftIcon && !loading && <span className="inline-flex">{leftIcon}</span>}
      <span className="inline-flex items-center">{children}</span>
      {rightIcon && !loading && <span className="inline-flex">{rightIcon}</span>}

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute h-5 w-5 animate-ripple rounded-full bg-white/30"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
          }}
        />
      ))}
    </button>
  );
}
