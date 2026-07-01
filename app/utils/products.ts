export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  thumbnail: string;
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductView = "cards" | "table";
export type ProductScrollMode = "pages" | "infinite";

export type ProductSearchParams = {
  page: number;
  limit: number;
  view: ProductView;
  scroll: ProductScrollMode;
};

export const DEFAULT_LIMIT = 12;
export const LIMIT_OPTIONS = [12, 24, 48] as const;

export function parseProductSearchParams(
  searchParams: URLSearchParams
): ProductSearchParams {
  const rawPage = Number(searchParams.get("page"));
  const rawLimit = Number(searchParams.get("limit"));

  return {
    page: Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1,
    limit:
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), 100)
        : DEFAULT_LIMIT,
    view: searchParams.get("view") === "table" ? "table" : "cards",
    scroll:
      searchParams.get("scroll") === "infinite" ? "infinite" : "pages",
  };
}

export function buildProductSearchParams(
  current: URLSearchParams,
  updates: Partial<ProductSearchParams>
) {
  const next = { ...parseProductSearchParams(current), ...updates };
  const params = new URLSearchParams();

  if (next.page !== 1) {
    params.set("page", String(next.page));
  }

  if (next.limit !== DEFAULT_LIMIT) {
    params.set("limit", String(next.limit));
  }

  if (next.view !== "cards") {
    params.set("view", next.view);
  }

  if (next.scroll !== "pages") {
    params.set("scroll", next.scroll);
  }

  return params;
}

export async function fetchProducts({
  limit = DEFAULT_LIMIT,
  skip = 0,
}: {
  limit?: number;
  skip?: number;
} = {}) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/products?limit=${limit}&skip=${skip}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return (await response.json()) as ProductsResponse;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getTotalPages(total: number, limit: number) {
  return Math.max(1, Math.ceil(total / limit));
}

export function getPageRange(page: number, limit: number, total: number) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return { start, end };
}

export function getVisiblePages(current: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current]);

  for (let offset = -1; offset <= 1; offset += 1) {
    const page = current + offset;
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  return [...pages].sort((left, right) => left - right);
}
