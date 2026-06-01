import { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    rectangular: "rounded-lg",
    circular: "rounded-full",
    text: "rounded",
  };

  const defaultHeight = {
    rectangular: "h-32",
    circular: "h-12 w-12",
    text: "h-4",
  };

  const combinedStyle = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
    ...style,
  };

  return (
    <div
      className={`animate-skeleton bg-gray-200 ${variantClasses[variant]} ${
        !height && !width ? defaultHeight[variant] : ""
      } ${className}`}
      style={combinedStyle}
      {...props}
    />
  );
}
