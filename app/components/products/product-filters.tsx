import { useEffect, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import { Skeleton } from "~/components/ui/skeleton";
import { useCategoriesQuery } from "~/hooks/use-queries";
import {
  buildProductSearchParams,
  hasActiveProductFilters,
  parseProductSearchParams,
} from "~/utils/products";

const SEARCH_DEBOUNCE_MS = 300;

export function ProductFiltersBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseProductSearchParams(searchParams);
  const { data: categories, isPending: categoriesPending } =
    useCategoriesQuery();
  const [searchInput, setSearchInput] = useState(filters.q);

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
  }

  return (
    <div className="rounded-xl border bg-card p-4 ring-1 ring-foreground/10">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2 md:col-span-2 xl:col-span-2">
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

        <div className="space-y-2">
          <Label htmlFor="product-category">Category</Label>
          {categoriesPending ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <NativeSelect
              id="product-category"
              value={filters.category}
              onChange={(event) =>
                updateParams({
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
                updateParams({
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
                updateParams({
                  maxPrice: parsePriceInput(event.target.value),
                  page: 1,
                })
              }
            />
          </div>
        </div>
      </div>

      {hasActiveProductFilters(filters) && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <XIcon />
            Clear filters
          </Button>
        </div>
      )}
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

function formatCategoryLabel(category: string) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
