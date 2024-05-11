import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="mb-4 h-8 w-40" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-2 h-6 w-32" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-2 h-6 w-48" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-2 h-6 w-64" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-2 h-6 w-64" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-2 h-6 w-32" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}