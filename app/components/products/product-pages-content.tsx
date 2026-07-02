import { AlertCircleIcon, SearchXIcon } from "lucide-react";

import { ProductCards } from "~/components/products/product-cards";
import { ProductPagination } from "~/components/products/product-pagination";
import { ProductsLoadingSkeleton } from "~/components/products/products-loading-skeleton";
import { ProductTable } from "~/components/products/product-table";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { useProductsQuery } from "~/hooks/use-queries";
import type { ProductListFilters, ProductView } from "~/utils/products";

type ProductPagesContentProps = {
  filters: ProductListFilters;
  view: ProductView;
};

export function ProductPagesContent({
  filters,
  view,
}: ProductPagesContentProps) {
  const { data, isPending, isError, error } = useProductsQuery(filters);

  if (isPending) {
    return (
      <ProductsLoadingSkeleton
        view={view}
        count={filters.limit}
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

  if (data.products.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>No products found</EmptyTitle>
          <EmptyDescription>
            Try adjusting your search or filter criteria.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      {view === "cards" ? (
        <ProductCards products={data.products} />
      ) : (
        <ProductTable products={data.products} />
      )}
      <ProductPagination
        page={filters.page}
        limit={filters.limit}
        total={data.total}
      />
    </>
  );
}
