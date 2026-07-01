export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (limit: number, skip: number) =>
      ["products", "list", { limit, skip }] as const,
    infinite: (limit: number) => ["products", "infinite", { limit }] as const,
  },
  auth: {
    all: ["auth"] as const,
    user: () => ["auth", "user"] as const,
  },
};
