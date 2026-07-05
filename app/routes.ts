import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("products/:id", "routes/product-detail.tsx"),
  route("favorites", "routes/favorites.tsx"),
  route("auth", "routes/auth.tsx"),
] satisfies RouteConfig;
