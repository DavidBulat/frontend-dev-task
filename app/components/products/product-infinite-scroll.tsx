import { useEffect, useRef } from "react";
import { AlertCircleIcon } from "lucide-react";

import { ProductCards } from "~/components/products/product-cards";
import { ProductCardSkeleton } from "~/components/products/product-card-skeleton";
import { ProductsLoadingSkeleton } from "~/components/products/products-loading-skeleton";
import { ProductTable } from "~/components/products/product-table";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useInfiniteProductsQuery } from "~/hooks/use-queries";
import type { ProductView } from "~/utils/products";

type ProductInfiniteScrollProps = {
  limit: number;
  view: ProductView;
};

export function ProductInfiniteScroll({
  limit,
  view,
}: ProductInfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProductsQuery(limit);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isPending) {
    return <ProductsLoadingSkeleton view={view} count={limit} />;
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Failed to load products</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Something went wrong"}
        </AlertDescription>
      </Alert>
    );
  }

  const products = data.pages.flatMap((page) => page.products);
  const total = data.pages[0]?.total ?? 0;

  const loadingRows = isFetchingNextPage ? Math.min(limit, 4) : 0;

  return (
    <div className="space-y-6">
      {view === "cards" ? (
        <>
          <ProductCards products={products} />
          {loadingRows > 0 && <ProductCardSkeleton count={loadingRows} />}
        </>
      ) : (
        <ProductTable products={products} loadingRows={loadingRows} />
      )}
      <div
        ref={sentinelRef}
        className="flex min-h-10 items-center justify-center"
        aria-hidden={!hasNextPage && !isFetchingNextPage}
      >
        {!hasNextPage && products.length > 0 && (
          <p className="text-sm text-muted-foreground">
            All {total} products loaded
          </p>
        )}
      </div>
    </div>
  );
}
