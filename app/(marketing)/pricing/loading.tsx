import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full flex-col gap-16 py-8 md:py-8">
      <section className="container flex flex-col items-center text-center">
        <div className="mx-auto mb-10 flex w-full flex-col gap-5">
          <Skeleton className="mx-auto h-4 w-40" />
          <Skeleton className="mx-auto h-10 w-96" />
        </div>

        <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="relative flex flex-col overflow-hidden rounded-xl border"
            >
              <div className="min-h-[150px] items-start space-y-4 bg-secondary/70 p-6">
                <Skeleton className="h-4 w-32" />
                <div className="flex flex-row">
                  <div className="flex items-end">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="-mb-1 ml-2 h-4 w-8" />
                  </div>
                </div>
                <Skeleton className="h-4 w-48" />
              </div>

              <div className="flex h-full flex-col justify-between gap-16 p-6">
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-start">
                      <Skeleton className="mr-3 size-4" />
                      <Skeleton className="size-4 w-48" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="mt-3 h-4 w-96" />
      </section>

      <hr className="container" />
    </div>
  );
}