import { useEffect, useState } from "react";

import { getSession } from "~/utils/auth";
import {
  getFavoriteIds,
  subscribeFavorites,
  toggleFavorite,
} from "~/utils/favorites";

export function useFavorites() {
  const userId = getSession()?.id ?? null;
  const [ids, setIds] = useState<number[]>(() =>
    userId ? getFavoriteIds(userId) : []
  );

  useEffect(() => {
    setIds(userId ? getFavoriteIds(userId) : []);

    return subscribeFavorites(() => {
      setIds(userId ? getFavoriteIds(userId) : []);
    });
  }, [userId]);

  return {
    ids,
    isLoggedIn: !!userId,
    isFavorite: (productId: number) => ids.includes(productId),
    toggle: (productId: number) => {
      if (!userId) {
        return;
      }

      toggleFavorite(userId, productId);
    },
  };
}
