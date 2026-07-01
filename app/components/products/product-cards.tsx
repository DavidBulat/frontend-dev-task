import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Product } from "~/utils/products";
import { formatPrice } from "~/utils/products";

type ProductCardsProps = {
  products: Product[];
};

export function ProductCards({ products }: ProductCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden pt-0">
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
            <CardDescription className="line-clamp-2">
              {product.description}
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto justify-between border-t-0 bg-transparent">
            <span className="font-medium">{formatPrice(product.price)}</span>
            <span className="text-muted-foreground">
              {product.rating.toFixed(1)} ★ · {product.stock} in stock
            </span>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
