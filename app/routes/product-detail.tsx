import { AlertCircleIcon, ArrowLeftIcon, PackageXIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

import type { Route } from "./+types/product-detail";
import { ProductDetailSkeleton } from "~/components/products/product-detail-skeleton";
import { ProductGallery } from "~/components/products/product-gallery";
import { FavoriteButton } from "~/components/products/favorite-button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Separator } from "~/components/ui/separator";
import { useProductQuery } from "~/hooks/use-queries";
import { getReturnToFromState } from "~/utils/product-navigation";
import {
  formatCategoryLabel,
  formatPrice,
} from "~/utils/products";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Product ${params.id}` }];
}

export default function ProductDetail({ params }: Route.ComponentProps) {
  const productId = Number(params.id);
  const location = useLocation();
  const returnTo = getReturnToFromState(location.state);
  const { data: product, isPending, isError, error } = useProductQuery(productId);

  if (!Number.isFinite(productId) || productId <= 0) {
    return (
      <ProductNotFound returnTo={returnTo} message="Invalid product ID." />
    );
  }

  if (isPending) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ProductDetailSkeleton />
      </main>
    );
  }

  if (isError || !product) {
    const isNotFound = error instanceof Error && error.message === "Product not found";

    if (isNotFound) {
      return (
        <main className="container mx-auto px-4 py-8">
          <ProductNotFound returnTo={returnTo} />
        </main>
      );
    }

    return (
      <main className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Failed to load product</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Something went wrong"}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link to={returnTo} />}
          className="pl-1.5!"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to products
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery images={product.images} title={product.title} />

          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {formatCategoryLabel(product.category)}
                </Badge>
                {product.brand && (
                  <Badge variant="outline">{product.brand}</Badge>
                )}
                {product.discountPercentage > 0 && (
                  <Badge variant="destructive">
                    -{product.discountPercentage.toFixed(0)}%
                  </Badge>
                )}
              </div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-2">
                <FavoriteButton productId={product.id} size="sm" />
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-2xl font-semibold">
                  {formatPrice(discountedPrice)}
                </p>
                {product.discountPercentage > 0 && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Rating</dt>
                <dd className="font-medium">{product.rating.toFixed(1)} / 5</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stock</dt>
                <dd className="font-medium">{product.stock} available</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="font-medium">{product.availabilityStatus}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium">{product.sku}</dd>
              </div>
            </dl>

            <Separator />

            <section className="space-y-2">
              <h2 className="font-medium">Description</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </section>

            {product.reviews.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-medium">Reviews</h2>
                <ul className="space-y-3">
                  {product.reviews.map((review, index) => (
                    <li
                      key={`${review.reviewerEmail}-${index}`}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {review.reviewerName}
                        </span>
                        <span className="text-muted-foreground">
                          {review.rating.toFixed(1)} ★
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductNotFound({
  returnTo,
  message = "The product you are looking for does not exist.",
}: {
  returnTo: string;
  message?: string;
}) {
  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link to={returnTo} />}
        className="pl-1.5!"
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Back to products
      </Button>
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageXIcon />
          </EmptyMedia>
          <EmptyTitle>Product not found</EmptyTitle>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
