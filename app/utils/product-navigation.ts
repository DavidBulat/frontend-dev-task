export type ProductReturnState = {
  returnTo: string;
  scrollY?: number;
};

const SCROLL_PREFIX = "list-scroll:";

export function getProductReturnTo(pathname: string, search: string) {
  return `${pathname}${search}`;
}

export function getReturnToFromState(state: unknown) {
  if (
    state &&
    typeof state === "object" &&
    "returnTo" in state &&
    typeof state.returnTo === "string"
  ) {
    return state.returnTo;
  }

  return "/";
}

export function getScrollYFromState(state: unknown) {
  if (
    state &&
    typeof state === "object" &&
    "scrollY" in state &&
    typeof state.scrollY === "number" &&
    Number.isFinite(state.scrollY)
  ) {
    return state.scrollY;
  }

  return null;
}

export function saveListScrollPosition(listUrl: string) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(`${SCROLL_PREFIX}${listUrl}`, String(window.scrollY));
}

export function consumeSavedScrollPosition(listUrl: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(`${SCROLL_PREFIX}${listUrl}`);
  sessionStorage.removeItem(`${SCROLL_PREFIX}${listUrl}`);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getProductDetailState(pathname: string, search: string) {
  return { returnTo: getProductReturnTo(pathname, search) };
}
