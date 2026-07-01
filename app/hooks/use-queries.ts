import {
  useInfiniteQuery,
  useMutation,
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
import { fetchProducts } from "~/utils/products";

export function useProductsQuery(limit: number, page: number) {
  const skip = (page - 1) * limit;

  return useQuery({
    queryKey: queryKeys.products.list(limit, skip),
    queryFn: () => fetchProducts({ limit, skip }),
  });
}

export function useInfiniteProductsQuery(limit: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.infinite(limit),
    queryFn: ({ pageParam }) => fetchProducts({ limit, skip: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.products.length;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
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
