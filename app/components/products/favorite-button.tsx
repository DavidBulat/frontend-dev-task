import { HeartIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "~/components/ui/button";
import { useFavorites } from "~/hooks/use-favorites";
import { cn } from "~/lib/utils";

type FavoriteButtonProps = {
  productId: number;
  className?: string;
  size?: "default" | "sm" | "icon";
};

export function FavoriteButton({
  productId,
  className,
  size = "icon",
}: FavoriteButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isFavorite, toggle } = useFavorites();
  const active = isFavorite(productId);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      navigate("/auth", {
        state: {
          returnTo: `${location.pathname}${location.search}`,
        },
      });
      return;
    }

    toggle(productId);
  }

  return (
    <Button
      type="button"
      variant={active ? "default" : "secondary"}
      size={size}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      onClick={handleClick}
      className={cn("shrink-0", className)}
    >
      <HeartIcon className={cn(active && "fill-current")} />
    </Button>
  );
}
