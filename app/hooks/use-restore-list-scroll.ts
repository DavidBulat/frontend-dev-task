import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

import {
  consumeSavedScrollPosition,
  getProductReturnTo,
  getScrollYFromState,
} from "~/utils/product-navigation";

export function useRestoreListScroll(isContentReady: boolean) {
  const location = useLocation();
  const listKey = getProductReturnTo(location.pathname, location.search);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    hasRestoredRef.current = false;
  }, [listKey]);

  useEffect(() => {
    if (!isContentReady || hasRestoredRef.current) {
      return;
    }

    const scrollY =
      getScrollYFromState(location.state) ??
      consumeSavedScrollPosition(listKey);

    if (scrollY === null) {
      return;
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
      hasRestoredRef.current = true;
    });
  }, [isContentReady, listKey, location.state]);
}
