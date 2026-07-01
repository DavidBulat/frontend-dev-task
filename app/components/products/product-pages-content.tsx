import { AlertCircleIcon } from "lucide-react";

import { ProductCards } from "~/components/products/product-cards";
import { ProductPagination } from "~/components/products/product-pagination";
import { ProductsLoadingSkeleton } from "~/components/products/products-loading-skeleton";
import { ProductTable } from "~/components/products/product-table";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useProductsQuery } from "~/hooks/use-queries";
import type { ProductView } from "~/utils/products";

type ProductPagesContentProps = {
  page: number;
  limit: number;
  view: ProductView;
};

export function ProductPagesContent({
  page,
  limit,
  view,
}: ProductPagesContentProps) {
  const { data, isPending, isError, error } = useProductsQuery(limit, page);

  if (isPending) {
    return (
      <ProductsLoadingSkeleton
        view={view}
        count={limit}
        showPagination
      />
    );
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

  return (
    <>
      {view === "cards" ? (
        <ProductCards products={data.products} />
      ) : (
        <ProductTable products={data.products} />
      )}
      <ProductPagination page={page} limit={limit} total={data.total} />
    </>
  );
}
