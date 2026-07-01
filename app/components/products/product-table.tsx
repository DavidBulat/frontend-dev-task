import { Badge } from "~/components/ui/badge";
import { ProductTableRowsSkeleton } from "~/components/products/product-table-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { Product } from "~/utils/products";
import { formatPrice } from "~/utils/products";

type ProductTableProps = {
  products: Product[];
  loadingRows?: number;
};

export function ProductTable({ products, loadingRows = 0 }: ProductTableProps) {
  return (
    <div className="rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="size-10 rounded-md object-cover"
                  loading="lazy"
                />
              </TableCell>
              <TableCell className="max-w-xs whitespace-normal">
                <div className="font-medium">{product.title}</div>
                <div className="line-clamp-1 text-muted-foreground">
                  {product.description}
                </div>
              </TableCell>
              <TableCell>{product.brand || "—"}</TableCell>
              <TableCell>
                <Badge variant="secondary">{product.category}</Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatPrice(product.price)}
              </TableCell>
              <TableCell className="text-right">
                {product.rating.toFixed(1)} ★
              </TableCell>
              <TableCell className="text-right">{product.stock}</TableCell>
            </TableRow>
          ))}
          {loadingRows > 0 && <ProductTableRowsSkeleton rows={loadingRows} />}
        </TableBody>
      </Table>
    </div>
  );
}
