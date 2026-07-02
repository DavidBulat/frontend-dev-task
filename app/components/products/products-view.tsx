import {
  InfinityIcon,
  LayoutGridIcon,
  ListOrderedIcon,
  TableIcon,
} from "lucide-react";
import { useSearchParams } from "react-router";

import { ProductFiltersBar } from "~/components/products/product-filters";
import { ProductInfiniteScroll } from "~/components/products/product-infinite-scroll";
import { ProductPagesContent } from "~/components/products/product-pages-content";
import { ProductsSummarySkeleton } from "~/components/products/products-loading-skeleton";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  useInfiniteProductsQuery,
  useProductsQuery,
} from "~/hooks/use-queries";
import {
  buildProductSearchParams,
  getPageRange,
  LIMIT_OPTIONS,
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
    limit,
  ].join("-");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <ProductsSummary filters={filters} isInfinite={isInfinite} />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Tabs
            value={scroll}
            onValueChange={(value) =>
              updateParams({
                scroll: value as "pages" | "infinite",
                page: 1,
              })
            }
          >
            <TabsList>
              <TabsTrigger value="pages">
                <ListOrderedIcon />
                Pages
              </TabsTrigger>
              <TabsTrigger value="infinite">
                <InfinityIcon />
                Infinite
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            value={view}
            onValueChange={(value) =>
              updateParams({ view: value as "cards" | "table" })
            }
          >
            <TabsList>
              <TabsTrigger value="cards">
                <LayoutGridIcon />
                Cards
              </TabsTrigger>
              <TabsTrigger value="table">
                <TableIcon />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <NativeSelect
            value={String(limit)}
            aria-label="Products per page"
            onChange={(event) =>
              updateParams({
                limit: Number(event.target.value),
                page: 1,
              })
            }
          >
            {LIMIT_OPTIONS.map((option) => (
              <NativeSelectOption key={option} value={String(option)}>
                {option} per page
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <ProductFiltersBar />

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
  const { q, category, minPrice, maxPrice, limit } = filters;
  const { data, isPending } = useInfiniteProductsQuery({
    q,
    category,
    minPrice,
    maxPrice,
    limit,
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
