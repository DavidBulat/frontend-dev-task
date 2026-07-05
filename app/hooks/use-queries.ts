import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "~/lib/query-keys";
import {
  fetchCurrentUser,
  getSession,
  login,
  logout,
  refreshSession,
  type AuthSession,
} from "~/utils/auth";
import {
  fetchCategories,
  fetchProduct,
  fetchProducts,
  type ProductFilters,
  type ProductListFilters,
} from "~/utils/products";

function toListQueryFilters({ page, ...filters }: ProductListFilters) {
  return {
    ...filters,
    skip: (page - 1) * filters.limit,
  };
}

function toInfiniteQueryFilters(
  filters: ProductFilters & {
    limit: number;
    sortBy: ProductListFilters["sortBy"];
    order: ProductListFilters["order"];
  }
) {
  return filters;
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductsQuery(filters: ProductListFilters) {
  const queryFilters = toListQueryFilters(filters);

  return useQuery({
    queryKey: queryKeys.products.list(queryFilters),
    queryFn: () =>
      fetchProducts({
        q: filters.q,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        limit: filters.limit,
        skip: queryFilters.skip,
        sortBy: filters.sortBy,
        order: filters.order,
      }),
  });
}

export function useInfiniteProductsQuery(
  filters: ProductFilters & {
    limit: number;
    sortBy: ProductListFilters["sortBy"];
    order: ProductListFilters["order"];
  }
) {
  const queryFilters = toInfiniteQueryFilters(filters);

  return useInfiniteQuery({
    queryKey: queryKeys.products.infinite(queryFilters),
    queryFn: ({ pageParam }) =>
      fetchProducts({
        q: filters.q,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        limit: filters.limit,
        skip: pageParam,
        sortBy: filters.sortBy,
        order: filters.order,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.products.length;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
  });
}

export function useProductQuery(id: number) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useFavoriteProductsQuery(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => fetchProduct(id),
      staleTime: 5 * 60 * 1000,
    })),
  });
}

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: fetchCurrentUser,
    enabled: !!getSession(),
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => login(username, password),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.user(), session);
    },
  });
}

export function useRefreshSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshSession,
    onSuccess: (session: AuthSession) => {
      queryClient.setQueryData(queryKeys.auth.user(), session);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      logout();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
