import { describe, expect, it, beforeEach } from "vitest";

import {
  consumeSavedScrollPosition,
  getProductDetailState,
  getProductReturnTo,
  getReturnToFromState,
  getScrollYFromState,
  saveListScrollPosition,
} from "./product-navigation";

describe("product navigation helpers", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("builds a return URL from pathname and search", () => {
    expect(getProductReturnTo("/", "?q=phone&page=2")).toBe("/?q=phone&page=2");
  });

  it("reads returnTo from router state", () => {
    expect(getReturnToFromState({ returnTo: "/?category=phones" })).toBe(
      "/?category=phones"
    );
  });

  it("falls back to home when state is missing", () => {
    expect(getReturnToFromState(undefined)).toBe("/");
    expect(getReturnToFromState({})).toBe("/");
  });

  it("reads scrollY from router state", () => {
    expect(getScrollYFromState({ scrollY: 240 })).toBe(240);
    expect(getScrollYFromState({ scrollY: "240" })).toBeNull();
  });

  it("saves and consumes scroll position for a list URL", () => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 420,
    });

    saveListScrollPosition("/?page=2");
    expect(consumeSavedScrollPosition("/?page=2")).toBe(420);
    expect(consumeSavedScrollPosition("/?page=2")).toBeNull();
  });

  it("builds product detail navigation state", () => {
    expect(getProductDetailState("/", "?page=3")).toEqual({
      returnTo: "/?page=3",
    });
  });
});
