import { useSearchParams } from "react-router";

import { ProductFiltersBar } from "~/components/products/product-filters";
import { ProductInfiniteScroll } from "~/components/products/product-infinite-scroll";
import { ProductPagesContent } from "~/components/products/product-pages-content";
import { ProductsSummarySkeleton } from "~/components/products/products-loading-skeleton";
import { ProductViewControls } from "~/components/products/product-view-controls";
import {
  useInfiniteProductsQuery,
  useProductsQuery,
} from "~/hooks/use-queries";
import { useRestoreListScroll } from "~/hooks/use-restore-list-scroll";
import {
  buildProductSearchParams,
  getPageRange,
  parseProductSearchParams,
  toProductListFilters,
} from "~/utils/products";

export function ProductsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = parseProductSearchParams(searchParams);
  const { page, limit, view, scroll } = params;
  const filters = toProductListFilters(params);
  const isInfinite = scroll === "infinite";

  function updateParams(updates: Parameters<typeof buildProductSearchParams>[1]) {
    setSearchParams(buildProductSearchParams(searchParams, updates));
  }

  const filterKey = [
    params.q,
    params.category,
    params.minPrice,
    params.maxPrice,
    params.sortBy,
    params.order,
    limit,
  ].join("-");

  const { isPending: isPagesPending } = useProductsQuery(filters);
  const { isPending: isInfinitePending } = useInfiniteProductsQuery({
    q: params.q,
    category: params.category,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    limit,
    sortBy: params.sortBy,
    order: params.order,
  });
  const isContentReady = isInfinite ? !isInfinitePending : !isPagesPending;

  useRestoreListScroll(isContentReady);

  const controls = (
    <ProductViewControls
      scroll={scroll}
      view={view}
      limit={limit}
      onScrollChange={(value) =>
        updateParams({
          scroll: value,
          page: 1,
        })
      }
      onViewChange={(value) => updateParams({ view: value })}
      onLimitChange={(value) =>
        updateParams({
          limit: value,
          page: 1,
        })
      }
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <ProductsSummary filters={filters} isInfinite={isInfinite} />

        <div className="hidden md:block">{controls}</div>
      </div>

      <ProductFiltersBar />

      <div className="md:hidden">{controls}</div>

      {isInfinite ? (
        <ProductInfiniteScroll
          key={filterKey}
          filters={filters}
          view={view}
        />
      ) : (
        <ProductPagesContent
          key={filterKey}
          filters={filters}
          view={view}
        />
      )}
    </div>
  );
}

function ProductsSummary({
  filters,
  isInfinite,
}: {
  filters: ReturnType<typeof toProductListFilters>;
  isInfinite: boolean;
}) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Products
      </h1>
      <p className="text-sm text-muted-foreground">
        {isInfinite ? (
          <InfiniteSummary filters={filters} />
        ) : (
          <PaginatedSummary filters={filters} />
        )}
      </p>
    </div>
  );
}

function PaginatedSummary({
  filters,
}: {
  filters: ReturnType<typeof toProductListFilters>;
}) {
  const { data, isPending } = useProductsQuery(filters);

  if (isPending || !data) {
    return <ProductsSummarySkeleton />;
  }

  const { start, end } = getPageRange(filters.page, filters.limit, data.total);

  if (data.total === 0) {
    return <>No products match your filters</>;
  }

  return (
    <>
      Showing {start}-{end} of {data.total} products
    </>
  );
}

function InfiniteSummary({
  filters,
}: {
  filters: ReturnType<typeof toProductListFilters>;
}) {
  const { q, category, minPrice, maxPrice, limit, sortBy, order } = filters;
  const { data, isPending } = useInfiniteProductsQuery({
    q,
    category,
    minPrice,
    maxPrice,
    limit,
    sortBy,
    order,
  });

  if (isPending || !data) {
    return <ProductsSummarySkeleton />;
  }

  const products = data.pages.flatMap((page) => page.products);
  const total = data.pages[0]?.total ?? 0;

  if (total === 0) {
    return <>No products match your filters</>;
  }

  return (
    <>
      Loaded {products.length} of {total} products
    </>
  );
}
