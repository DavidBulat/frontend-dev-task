import { Card, CardFooter, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

type ProductCardSkeletonProps = {
  count?: number;
};

export function ProductCardSkeleton({ count = 8 }: ProductCardSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden pt-0">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <CardHeader>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
          </CardHeader>
          <CardFooter className="mt-auto justify-between border-t-0 bg-transparent">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-28" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
