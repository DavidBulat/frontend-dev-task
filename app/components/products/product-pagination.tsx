import { Link, useSearchParams } from "react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "~/components/ui/pagination";
import {
  buildProductSearchParams,
  getTotalPages,
  getVisiblePages,
} from "~/utils/products";

type ProductPaginationProps = {
  page: number;
  limit: number;
  total: number;
};

export function ProductPagination({
  page,
  limit,
  total,
}: ProductPaginationProps) {
  const [searchParams] = useSearchParams();
  const totalPages = getTotalPages(total, limit);
  const visiblePages = getVisiblePages(page, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  function pageSearch(pageNumber: number) {
    return buildProductSearchParams(searchParams, { page: pageNumber }).toString();
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="default"
            nativeButton={false}
            className="pl-1.5!"
            aria-label="Go to previous page"
            aria-disabled={page <= 1}
            disabled={page <= 1}
            render={
              <Link
                to={{ search: pageSearch(page - 1) }}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : undefined}
              />
            }
          >
            <ChevronLeftIcon data-icon="inline-start" />
            <span className="hidden sm:block">Previous</span>
          </Button>
        </PaginationItem>
        {visiblePages.map((pageNumber, index) => {
          const previousPage = visiblePages[index - 1];
          const showEllipsis =
            index > 0 && previousPage !== undefined && pageNumber - previousPage > 1;

          return (
            <span key={pageNumber} className="contents">
              {showEllipsis && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <Button
                  variant={pageNumber === page ? "outline" : "ghost"}
                  size="icon"
                  nativeButton={false}
                  render={
                    <Link
                      to={{ search: pageSearch(pageNumber) }}
                      aria-current={pageNumber === page ? "page" : undefined}
                    />
                  }
                >
                  {pageNumber}
                </Button>
              </PaginationItem>
            </span>
          );
        })}
        <PaginationItem>
          <Button
            variant="ghost"
            size="default"
            nativeButton={false}
            className="pr-1.5!"
            aria-label="Go to next page"
            aria-disabled={page >= totalPages}
            disabled={page >= totalPages}
            render={
              <Link
                to={{ search: pageSearch(page + 1) }}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : undefined}
              />
            }
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
