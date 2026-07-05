import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductCards } from "./product-cards";
import { renderWithProviders } from "../../../test/test-utils";
import type { Product } from "~/utils/products";

vi.mock("~/hooks/use-favorites", () => ({
  useFavorites: () => ({
    ids: [],
    isLoggedIn: false,
    isFavorite: () => false,
    toggle: vi.fn(),
  }),
}));

const mockProduct: Product = {
  id: 12,
  title: "Annibale Colombo Sofa",
  description:
    "The Annibale Colombo Sofa is a sophisticated and comfortable seating option, featuring exquisite design and premium upholstery for your living room.",
  category: "furniture",
  price: 2499.99,
  discountPercentage: 14.4,
  rating: 3.92,
  stock: 60,
  brand: "Annibale Colombo",
  thumbnail: "https://example.com/sofa.webp",
};

describe("ProductCards", () => {
  it("renders product information and links to the detail page", () => {
    renderWithProviders(<ProductCards products={[mockProduct]} />, {
      routerProps: { initialEntries: ["/?q=sofa&page=2"] },
    });

    expect(screen.getByText("Annibale Colombo Sofa")).toBeInTheDocument();
    expect(screen.getByText("$2,499.99")).toBeInTheDocument();
    expect(screen.getByText(/3.9/)).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /annibale colombo sofa/i });
    expect(link).toHaveAttribute("href", "/products/12");
  });

  it("truncates long descriptions on the card", () => {
    renderWithProviders(<ProductCards products={[mockProduct]} />);

    const truncated = `${mockProduct.description.slice(0, 100).trimEnd()}…`;
    expect(screen.getByText(truncated)).toBeInTheDocument();
    expect(screen.queryByText(mockProduct.description)).not.toBeInTheDocument();
  });
});
