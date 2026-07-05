import { Link, useLocation } from "react-router";

import { FavoriteButton } from "~/components/products/favorite-button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getProductReturnTo } from "~/utils/product-navigation";
import type { Product } from "~/utils/products";
import { formatPrice, truncateDescription } from "~/utils/products";

type ProductCardsProps = {
  products: Product[];
};

export function ProductCards({ products }: ProductCardsProps) {
  const location = useLocation();
  const returnTo = getProductReturnTo(location.pathname, location.search);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/products/${product.id}`}
          state={{ returnTo }}
          className="group block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Card className="relative h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
            <FavoriteButton
              productId={product.id}
              className="absolute top-2 right-2 z-10"
            />
            <img
              src={product.thumbnail}
              alt={product.title}
              className="aspect-4/3 w-full object-cover"
              loading="lazy"
            />
            <CardHeader>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{product.category}</Badge>
                {product.brand && (
                  <Badge variant="outline">{product.brand}</Badge>
                )}
              </div>
              <CardTitle className="line-clamp-2">{product.title}</CardTitle>
              <CardDescription>
                {truncateDescription(product.description)}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto justify-between border-t-0 bg-transparent">
              <span className="font-medium">{formatPrice(product.price)}</span>
              <span className="text-muted-foreground">
                {product.rating.toFixed(1)} ★ · {product.stock} in stock
              </span>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
