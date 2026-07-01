import {
  InfinityIcon,
  LayoutGridIcon,
  ListOrderedIcon,
  TableIcon,
} from "lucide-react";
import { useSearchParams } from "react-router";

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
} from "~/utils/products";

export function ProductsView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, limit, view, scroll } = parseProductSearchParams(searchParams);
  const isInfinite = scroll === "infinite";

  function updateParams(updates: Parameters<typeof buildProductSearchParams>[1]) {
    setSearchParams(buildProductSearchParams(searchParams, updates));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <ProductsSummary page={page} limit={limit} isInfinite={isInfinite} />

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

      {isInfinite ? (
        <ProductInfiniteScroll key={limit} limit={limit} view={view} />
      ) : (
        <ProductPagesContent page={page} limit={limit} view={view} />
      )}
    </div>
  );
}

function ProductsSummary({
  page,
  limit,
  isInfinite,
}: {
  page: number;
  limit: number;
  isInfinite: boolean;
}) {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Products
      </h1>
      <p className="text-sm text-muted-foreground">
        {isInfinite ? (
          <InfiniteSummary limit={limit} />
        ) : (
          <PaginatedSummary page={page} limit={limit} />
        )}
      </p>
    </div>
  );
}

function PaginatedSummary({ page, limit }: { page: number; limit: number }) {
  const { data, isPending } = useProductsQuery(limit, page);

  if (isPending || !data) {
    return <ProductsSummarySkeleton />;
  }

  const { start, end } = getPageRange(page, limit, data.total);

  return <>Showing {start}-{end} of {data.total} products</>;
}

function InfiniteSummary({ limit }: { limit: number }) {
  const { data, isPending } = useInfiniteProductsQuery(limit);

  if (isPending || !data) {
    return <ProductsSummarySkeleton />;
  }

  const products = data.pages.flatMap((page) => page.products);
  const total = data.pages[0]?.total ?? 0;

  return <>Loaded {products.length} of {total} products</>;
}
