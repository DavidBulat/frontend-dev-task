import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ProductFiltersBar } from "./product-filters";

vi.mock("~/hooks/use-queries", () => ({
  useCategoriesQuery: () => ({
    data: ["smartphones", "laptops"],
    isPending: false,
  }),
}));

function renderFilters(initialEntry = "/") {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <ProductFiltersBar />,
      },
    ],
    { initialEntries: [initialEntry] }
  );

  render(<RouterProvider router={router} />);

  return router;
}

describe("ProductFiltersBar", () => {
  it("renders search and category controls", () => {
    renderFilters();

    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Min price")).toBeInTheDocument();
    expect(screen.getByLabelText("Max price")).toBeInTheDocument();
    expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
  });

  it("updates the URL when category changes", async () => {
    const user = userEvent.setup();
    const router = renderFilters();

    await user.selectOptions(screen.getByLabelText("Category"), "smartphones");

    await waitFor(() => {
      expect(router.state.location.search).toContain("category=smartphones");
    });
  });

  it("debounces search input before updating the URL", async () => {
    vi.useFakeTimers();
    const router = renderFilters();

    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "phone" },
    });

    expect(router.state.location.search).not.toContain("q=phone");

    await vi.advanceTimersByTimeAsync(300);

    expect(router.state.location.search).toContain("q=phone");

    vi.useRealTimers();
  });

  it("shows clear filters when filters are active", () => {
    renderFilters("/?q=phone&category=smartphones");

    expect(
      screen.getByRole("button", { name: /clear filters/i })
    ).toBeInTheDocument();
  });
});
