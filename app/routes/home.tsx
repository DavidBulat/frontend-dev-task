import type { Route } from "./+types/home";
import { ProductsView } from "~/components/products/products-view";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Products" },
    { name: "description", content: "Browse products from DummyJSON" },
  ];
}

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <ProductsView />
    </main>
  );
}
