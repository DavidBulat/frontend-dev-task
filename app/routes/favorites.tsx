import { HeartOffIcon } from "lucide-react";

import type { Route } from "./+types/favorites";
import { ProtectedRoute } from "~/components/auth/protected-route";
import { ProductCards } from "~/components/products/product-cards";
import { ProductsLoadingSkeleton } from "~/components/products/products-loading-skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { useFavoriteProductsQuery } from "~/hooks/use-queries";
import { useFavorites } from "~/hooks/use-favorites";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Favorites" },
    { name: "description", content: "Your favorite products" },
  ];
}

export default function Favorites() {
  return (
    <ProtectedRoute>
      <FavoritesContent />
    </ProtectedRoute>
  );
}

function FavoritesContent() {
  const { ids } = useFavorites();
  const queries = useFavoriteProductsQuery(ids);
  const isPending = queries.some((query) => query.isPending);
  const products = queries
    .map((query) => query.data)
    .filter((product): product is NonNullable<typeof product> => !!product);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Favorites
          </h1>
          <p className="text-sm text-muted-foreground">
            {products.length} saved product{products.length === 1 ? "" : "s"}
          </p>
        </div>

        {ids.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HeartOffIcon />
              </EmptyMedia>
              <EmptyTitle>No favorites yet</EmptyTitle>
              <EmptyDescription>
                Browse products and tap the heart icon to save items here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : isPending ? (
          <ProductsLoadingSkeleton view="cards" count={Math.min(ids.length, 8)} />
        ) : (
          <ProductCards products={products} />
        )}
      </div>
    </main>
  );
}
