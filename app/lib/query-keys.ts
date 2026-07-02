export const queryKeys = {
  products: {
    all: ["products"] as const,
    categories: () => ["products", "categories"] as const,
    list: (filters: Record<string, unknown>) =>
      ["products", "list", filters] as const,
    infinite: (filters: Record<string, unknown>) =>
      ["products", "infinite", filters] as const,
  },
  auth: {
    all: ["auth"] as const,
    user: () => ["auth", "user"] as const,
  },
};
