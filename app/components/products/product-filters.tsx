import { useEffect, useState } from "react";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useSearchParams } from "react-router";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { useCategoriesQuery } from "~/hooks/use-queries";
import {
  buildProductSearchParams,
  decodeProductSort,
  encodeProductSort,
  formatCategoryLabel,
  hasActiveProductFilters,
  parseProductSearchParams,
  PRODUCT_SORT_OPTIONS,
} from "~/utils/products";

const SEARCH_DEBOUNCE_MS = 300;

export function ProductFiltersBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseProductSearchParams(searchParams);
  const { data: categories, isPending: categoriesPending } =
    useCategoriesQuery();
  const [searchInput, setSearchInput] = useState(filters.q);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchParams((current) => {
        const currentQ = parseProductSearchParams(current).q;

        if (searchInput.trim() === currentQ) {
          return current;
        }

        return buildProductSearchParams(current, {
          q: searchInput.trim(),
          page: 1,
        });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  function updateParams(
    updates: Parameters<typeof buildProductSearchParams>[1]
  ) {
    setSearchParams(buildProductSearchParams(searchParams, updates));
  }

  function handleClearFilters() {
    setSearchInput("");
    setSearchParams(
      buildProductSearchParams(searchParams, {
        q: "",
        category: "",
        minPrice: null,
        maxPrice: null,
        page: 1,
      })
    );
    setSheetOpen(false);
  }

  const hasSheetFilters =
    !!filters.category ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    !!filters.sortBy;

  return (
    <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex gap-3 sm:col-span-2 xl:col-span-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="product-search">Search</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="product-search"
                type="search"
                placeholder="Search by product name..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="relative flex shrink-0 items-end sm:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Open filters"
                  />
                }
              >
                <SlidersHorizontalIcon />
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85dvh]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 overflow-y-auto px-4 pb-4">
                  <AdvancedFilters
                    filters={filters}
                    categories={categories}
                    categoriesPending={categoriesPending}
                    onUpdate={updateParams}
                  />
                  <ProductSortSelect
                    id="product-sort-mobile"
                    filters={filters}
                    onUpdate={updateParams}
                  />
                  {hasActiveProductFilters(filters) && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleClearFilters}
                    >
                      <XIcon />
                      Clear filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            {hasSheetFilters && (
              <Badge
                variant="secondary"
                className="pointer-events-none absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px]"
              >
                !
              </Badge>
            )}
          </div>
        </div>

        <AdvancedFilters
          className="hidden sm:contents"
          filters={filters}
          categories={categories}
          categoriesPending={categoriesPending}
          onUpdate={updateParams}
        />
      </div>

      <div className="mt-4 hidden max-w-xs sm:block">
        <ProductSortSelect filters={filters} onUpdate={updateParams} />
      </div>

      {hasActiveProductFilters(filters) && (
        <div className="mt-4 hidden justify-end sm:flex">
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <XIcon />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

function AdvancedFilters({
  className,
  filters,
  categories,
  categoriesPending,
  onUpdate,
}: {
  className?: string;
  filters: ReturnType<typeof parseProductSearchParams>;
  categories: string[] | undefined;
  categoriesPending: boolean;
  onUpdate: (updates: Parameters<typeof buildProductSearchParams>[1]) => void;
}) {
  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor="product-category">Category</Label>
        {categoriesPending ? (
          <Skeleton className="h-8 w-full" />
        ) : (
          <NativeSelect
            id="product-category"
            value={filters.category}
            onChange={(event) =>
              onUpdate({
                category: event.target.value,
                page: 1,
              })
            }
          >
            <NativeSelectOption value="">All categories</NativeSelectOption>
            {categories?.map((category) => (
              <NativeSelectOption key={category} value={category}>
                {formatCategoryLabel(category)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="min-price">Min price</Label>
          <Input
            id="min-price"
            type="number"
            min={0}
            step={0.01}
            placeholder="0"
            value={filters.minPrice ?? ""}
            onChange={(event) =>
              onUpdate({
                minPrice: parsePriceInput(event.target.value),
                page: 1,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-price">Max price</Label>
          <Input
            id="max-price"
            type="number"
            min={0}
            step={0.01}
            placeholder="Any"
            value={filters.maxPrice ?? ""}
            onChange={(event) =>
              onUpdate({
                maxPrice: parsePriceInput(event.target.value),
                page: 1,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

function ProductSortSelect({
  id = "product-sort",
  filters,
  onUpdate,
}: {
  id?: string;
  filters: ReturnType<typeof parseProductSearchParams>;
  onUpdate: (updates: Parameters<typeof buildProductSearchParams>[1]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Sort by</Label>
      <NativeSelect
        id={id}
        value={encodeProductSort(filters.sortBy, filters.order)}
        onChange={(event) => {
          const { sortBy, order } = decodeProductSort(event.target.value);
          onUpdate({ sortBy, order, page: 1 });
        }}
      >
        {PRODUCT_SORT_OPTIONS.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

function parsePriceInput(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
