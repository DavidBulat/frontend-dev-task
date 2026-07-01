import { ProductCardSkeleton } from "~/components/products/product-card-skeleton";
import { ProductTableSkeleton } from "~/components/products/product-table-skeleton";
import { Skeleton } from "~/components/ui/skeleton";
import type { ProductView } from "~/utils/products";

type ProductsLoadingSkeletonProps = {
  view: ProductView;
  count?: number;
  showPagination?: boolean;
};

export function ProductsLoadingSkeleton({
  view,
  count = 8,
  showPagination = false,
}: ProductsLoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      {view === "cards" ? (
        <ProductCardSkeleton count={count} />
      ) : (
        <ProductTableSkeleton rows={count} />
      )}
      {showPagination && (
        <div className="flex justify-center gap-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          <Skeleton className="size-8" />
          <Skeleton className="h-8 w-16" />
        </div>
      )}
    </div>
  );
}

export function ProductsSummarySkeleton() {
  return <Skeleton className="h-4 w-48" />;
}
