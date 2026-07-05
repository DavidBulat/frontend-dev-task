import { describe, expect, it } from "vitest";

import {
  buildProductSearchParams,
  decodeProductSort,
  encodeProductSort,
  formatCategoryLabel,
  getPageRange,
  getTotalPages,
  getVisiblePages,
  hasActiveProductFilters,
  parseProductSearchParams,
  sortProducts,
  truncateDescription,
  type Product,
} from "./products";

describe("parseProductSearchParams", () => {
  it("returns defaults for an empty query string", () => {
    expect(parseProductSearchParams(new URLSearchParams())).toEqual({
      q: "",
      category: "",
      minPrice: null,
      maxPrice: null,
      page: 1,
      limit: 12,
      view: "cards",
      scroll: "pages",
      sortBy: "",
      order: "asc",
    });
  });

  it("parses filters and pagination from the URL", () => {
    const params = new URLSearchParams(
      "q=phone&category=smartphones&minPrice=100&maxPrice=500&page=2&limit=24&view=table&scroll=infinite&sortBy=price&order=desc"
    );

    expect(parseProductSearchParams(params)).toEqual({
      q: "phone",
      category: "smartphones",
      minPrice: 100,
      maxPrice: 500,
      page: 2,
      limit: 24,
      view: "table",
      scroll: "infinite",
      sortBy: "price",
      order: "desc",
    });
  });

  it("defaults sort when sort params are missing", () => {
    const params = new URLSearchParams(
      "q=phone&category=smartphones&minPrice=100&maxPrice=500&page=2&limit=24&view=table&scroll=infinite"
    );

    expect(parseProductSearchParams(params)).toEqual({
      q: "phone",
      category: "smartphones",
      minPrice: 100,
      maxPrice: 500,
      page: 2,
      limit: 24,
      view: "table",
      scroll: "infinite",
      sortBy: "",
      order: "asc",
    });
  });
});

describe("product sort helpers", () => {
  const products: Product[] = [
    {
      id: 1,
      title: "Zebra Phone",
      description: "",
      category: "smartphones",
      price: 300,
      discountPercentage: 0,
      rating: 4.2,
      stock: 10,
      brand: "A",
      thumbnail: "",
    },
    {
      id: 2,
      title: "Alpha Phone",
      description: "",
      category: "smartphones",
      price: 100,
      discountPercentage: 0,
      rating: 4.8,
      stock: 10,
      brand: "B",
      thumbnail: "",
    },
  ];

  it("encodes and decodes sort options", () => {
    expect(encodeProductSort("price", "desc")).toBe("price-desc");
    expect(decodeProductSort("rating-asc")).toEqual({
      sortBy: "rating",
      order: "asc",
    });
    expect(decodeProductSort("")).toEqual({ sortBy: "", order: "asc" });
  });

  it("sorts products by price, rating, and title", () => {
    expect(sortProducts(products, "price", "asc").map((product) => product.id)).toEqual([
      2, 1,
    ]);
    expect(sortProducts(products, "rating", "desc").map((product) => product.id)).toEqual([
      2, 1,
    ]);
    expect(sortProducts(products, "title", "asc").map((product) => product.id)).toEqual([
      2, 1,
    ]);
  });
});

describe("buildProductSearchParams", () => {
  it("omits default values from the generated query string", () => {
    const params = buildProductSearchParams(new URLSearchParams(), {
      q: "phone",
      category: "smartphones",
      page: 2,
      limit: 24,
      view: "table",
      scroll: "infinite",
    });

    expect(params.toString()).toBe(
      "q=phone&category=smartphones&page=2&limit=24&view=table&scroll=infinite"
    );
  });

  it("includes sort params when sorting is active", () => {
    const params = buildProductSearchParams(new URLSearchParams(), {
      q: "phone",
      category: "smartphones",
      page: 2,
      limit: 24,
      view: "table",
      scroll: "infinite",
      sortBy: "price",
      order: "desc",
    });

    expect(params.toString()).toBe(
      "q=phone&category=smartphones&page=2&limit=24&view=table&scroll=infinite&sortBy=price&order=desc"
    );
  });

  it("resets page when filters change", () => {
    const current = new URLSearchParams("q=old&page=3");
    const params = buildProductSearchParams(current, { q: "new", page: 1 });

    expect(params.get("q")).toBe("new");
    expect(params.has("page")).toBe(false);
  });
});

describe("hasActiveProductFilters", () => {
  it("detects active filters", () => {
    expect(
      hasActiveProductFilters({
        q: "",
        category: "",
        minPrice: null,
        maxPrice: null,
      })
    ).toBe(false);

    expect(
      hasActiveProductFilters({
        q: "phone",
        category: "",
        minPrice: null,
        maxPrice: null,
      })
    ).toBe(true);
  });
});

describe("truncateDescription", () => {
  it("leaves short descriptions unchanged", () => {
    expect(truncateDescription("Short description")).toBe("Short description");
  });

  it("truncates long descriptions to 100 characters", () => {
    const description = "a".repeat(120);
    const result = truncateDescription(description);

    expect(result.length).toBeLessThanOrEqual(101);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("formatCategoryLabel", () => {
  it("formats category slugs for display", () => {
    expect(formatCategoryLabel("home-decoration")).toBe("Home Decoration");
  });
});

describe("pagination helpers", () => {
  it("calculates total pages", () => {
    expect(getTotalPages(25, 12)).toBe(3);
    expect(getTotalPages(0, 12)).toBe(1);
  });

  it("calculates page range", () => {
    expect(getPageRange(2, 12, 25)).toEqual({ start: 13, end: 24 });
    expect(getPageRange(1, 12, 0)).toEqual({ start: 0, end: 0 });
  });

  it("returns visible page numbers with ellipsis gaps", () => {
    expect(getVisiblePages(5, 10)).toEqual([1, 4, 5, 6, 10]);
  });
});
