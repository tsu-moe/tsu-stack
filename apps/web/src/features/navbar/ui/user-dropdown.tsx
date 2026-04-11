import {
  IconContract,
  IconGraph,
  IconLock,
  IconLogout,
  IconUserSquareRounded,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { authClient } from "@tsu-stack/auth/react/auth-client";
import { useAuthSuspense } from "@tsu-stack/auth/react/tanstack-start/hooks";
import { getAuthQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { m } from "@tsu-stack/i18n/messages";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Avatar, AvatarFallback, AvatarImage } from "@tsu-stack/ui/components/avatar";
import { Button } from "@tsu-stack/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@tsu-stack/ui/components/dropdown-menu";

import { NavbarUnauthenticatedButtons } from "./navbar-unauthenticated-buttons";

export function UserDropdown() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthSuspense();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onResponse: async () => {
          // Invalidate to sync across all tabs
          await queryClient.invalidateQueries(getAuthQueryOptions());
          await router.invalidate();
        },
      },
    });
  };

  if (!user) {
    return <NavbarUnauthenticatedButtons />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Open account menu" size="icon" variant="ghost">
          <IconUserSquareRounded aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-sm min-w-fit">
        <DropdownMenuLabel className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={user?.name ?? "User"} />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {user?.name ?? "Guest"}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user?.email ?? "You are not authenticated"}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard">
              <IconGraph aria-hidden="true" className="opacity-60" size={16} />
              <span>{m.user_dropdown__dashboard()}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/privacy-policy">
              <IconLock aria-hidden="true" className="opacity-60" size={16} />
              <span>{m.user_dropdown__privacy_policy()}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/terms-of-service">
              <IconContract aria-hidden="true" className="opacity-60" size={16} />
              <span>{m.user_dropdown__terms_of_service()}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" variant="destructive" onClick={handleSignOut}>
          <IconLogout aria-hidden="true" className="opacity-60" />
          <button onClick={handleSignOut}>{m.user_dropdown__logout()}</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
