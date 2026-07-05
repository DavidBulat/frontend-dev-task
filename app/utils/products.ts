import { env } from "~/lib/env";

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

export type ProductDetail = Product & {
  images: string[];
  tags: string[];
  sku: string;
  weight: number;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  returnPolicy: string;
  minimumOrderQuantity: number;
  reviews: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }>;
};

export type ProductsResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductView = "cards" | "table";
export type ProductScrollMode = "pages" | "infinite";

export type ProductFilters = {
  q: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
};

export type ProductSearchParams = ProductFilters & {
  page: number;
  limit: number;
  view: ProductView;
  scroll: ProductScrollMode;
};

export type ProductListFilters = ProductFilters & {
  limit: number;
  page: number;
};

export const DEFAULT_LIMIT = 12;
export const LIMIT_OPTIONS = [12, 24, 48] as const;

function parseOptionalPrice(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parseProductSearchParams(
  searchParams: URLSearchParams
): ProductSearchParams {
  const rawPage = Number(searchParams.get("page"));
  const rawLimit = Number(searchParams.get("limit"));

  return {
    q: searchParams.get("q")?.trim() ?? "",
    category: searchParams.get("category") ?? "",
    minPrice: parseOptionalPrice(searchParams.get("minPrice")),
    maxPrice: parseOptionalPrice(searchParams.get("maxPrice")),
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

export function toProductListFilters(
  params: ProductSearchParams
): ProductListFilters {
  return {
    q: params.q,
    category: params.category,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    limit: params.limit,
    page: params.page,
  };
}

export function buildProductSearchParams(
  current: URLSearchParams,
  updates: Partial<ProductSearchParams>
) {
  const next = { ...parseProductSearchParams(current), ...updates };
  const params = new URLSearchParams();

  if (next.q) {
    params.set("q", next.q);
  }

  if (next.category) {
    params.set("category", next.category);
  }

  if (next.minPrice != null) {
    params.set("minPrice", String(next.minPrice));
  }

  if (next.maxPrice != null) {
    params.set("maxPrice", String(next.maxPrice));
  }

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

export function hasActiveProductFilters(filters: ProductFilters) {
  return (
    !!filters.q ||
    !!filters.category ||
    filters.minPrice != null ||
    filters.maxPrice != null
  );
}

function applyClientFilters(
  products: Product[],
  { category, minPrice, maxPrice, q }: ProductFilters
) {
  return products.filter((product) => {
    if (q && category && product.category !== category) {
      return false;
    }

    if (minPrice != null && product.price < minPrice) {
      return false;
    }

    if (maxPrice != null && product.price > maxPrice) {
      return false;
    }

    return true;
  });
}

export async function fetchProduct(id: number) {
  const response = await fetch(
    `${env.apiUrl}/products/${id}`
  );

  if (response.status === 404) {
    throw new Error("Product not found");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return (await response.json()) as ProductDetail;
}

export async function fetchCategories() {
  const response = await fetch(
    `${env.apiUrl}/products/category-list`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return (await response.json()) as string[];
}

export async function fetchProducts({
  limit = DEFAULT_LIMIT,
  skip = 0,
  q = "",
  category = "",
  minPrice = null,
  maxPrice = null,
}: ProductFilters & {
  limit?: number;
  skip?: number;
}) {
  const filters: ProductFilters = { q, category, minPrice, maxPrice };

  if (!hasActiveProductFilters(filters)) {
    const response = await fetch(
      `${env.apiUrl}/products?limit=${limit}&skip=${skip}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return (await response.json()) as ProductsResponse;
  }

  let url: string;

  if (q) {
    url = `${env.apiUrl}/products/search?q=${encodeURIComponent(q)}&limit=0`;
  } else if (category) {
    url = `${env.apiUrl}/products/category/${encodeURIComponent(category)}?limit=0`;
  } else {
    url = `${env.apiUrl}/products?limit=0`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = (await response.json()) as ProductsResponse;
  const filtered = applyClientFilters(data.products, filters);
  const paginated = filtered.slice(skip, skip + limit);

  return {
    products: paginated,
    total: filtered.length,
    skip,
    limit,
  } satisfies ProductsResponse;
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function truncateDescription(description: string, maxLength = 100) {
  if (description.length <= maxLength) {
    return description;
  }

  return `${description.slice(0, maxLength).trimEnd()}…`;
}

export function formatCategoryLabel(category: string) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
