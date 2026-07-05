import { HeartIcon, LogInIcon, LogOutIcon, PackageIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router";

import { ThemeToggle } from "~/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useFavorites } from "~/hooks/use-favorites";
import {
  useCurrentUserQuery,
  useLogoutMutation,
} from "~/hooks/use-queries";
import { cn } from "~/lib/utils";
import { getSession } from "~/utils/auth";

const navLinkClassName = ({
  isActive,
}: {
  isActive: boolean;
  isPending: boolean;
  isTransitioning: boolean;
}) =>
  cn(
    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
    isActive && "bg-muted text-foreground"
  );

export function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!getSession();
  const { ids } = useFavorites();
  const { data: user, isPending } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const displayUser = user ?? getSession();

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/auth"),
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <NavLink
          to="/"
          end
          className="font-heading text-base font-semibold tracking-tight"
        >
          Shop
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClassName}>
            <PackageIcon />
            Products
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/favorites" className={navLinkClassName}>
              <HeartIcon />
              <span className="hidden sm:inline">Favorites</span>
              {ids.length > 0 && (
                <span className="text-xs text-muted-foreground">({ids.length})</span>
              )}
            </NavLink>
          )}

          <ThemeToggle />

          {isLoggedIn ? (
            <div className="ml-1 flex items-center gap-2">
              {isPending && !displayUser ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Avatar size="sm">
                    {displayUser?.image ? (
                      <AvatarImage
                        src={displayUser.image}
                        alt={displayUser.firstName ?? displayUser.username}
                      />
                    ) : null}
                    <AvatarFallback>
                      {(displayUser?.firstName?.[0] ??
                        displayUser?.username?.[0] ??
                        "U"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate text-sm font-medium">
                    {displayUser?.firstName ?? displayUser?.username}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOutIcon />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          ) : (
            <NavLink to="/auth" className={navLinkClassName}>
              <LogInIcon />
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
