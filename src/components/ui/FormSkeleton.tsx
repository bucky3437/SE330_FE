import { Skeleton } from "./Skeleton";

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          {/* Label skeleton */}
          <Skeleton variant="text" className="mb-2 h-3 w-24" />
          {/* Input skeleton */}
          <Skeleton variant="rectangular" className="h-12 w-full rounded-lg" />
        </div>
      ))}
      {/* Button skeleton */}
      <div className="mt-6">
        <Skeleton variant="rectangular" className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
