import { IconLogout, IconMenu2, IconX } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useRouterState } from "@tanstack/react-router";
import React, { Suspense } from "react";

import { authClient } from "@tsu-stack/auth/react/auth-client";
import { useAuthSuspense } from "@tsu-stack/auth/react/tanstack-start/hooks";
import { getAuthUserQueryOptions } from "@tsu-stack/auth/react/tanstack-start/queries";
import { Link } from "@tsu-stack/i18n/tanstack-start/components/link";
import { Avatar, AvatarFallback, AvatarImage } from "@tsu-stack/ui/components/avatar";
import { Button } from "@tsu-stack/ui/components/button";
import { Portal, PortalBackdrop } from "@tsu-stack/ui/components/portal";
import { cn } from "@tsu-stack/ui/lib/utils";

import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

import { navLinks } from "./navbar";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  const onNavigate = () => setOpen(false);

  return (
    <div className="flex items-center gap-2 md:hidden">
      <LocaleSwitcher variant="outline" size="icon" />
      <ThemeSwitcher className="md:hidden" variant="outline" />
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? <IconX className="size-4.5" /> : <IconMenu2 className="size-4.5" />}
      </Button>
      {open && (
        <Portal className="top-(--navbar-height)" id="mobile-menu">
          <PortalBackdrop className="bg-background!" />
          <div
            className={cn(
              "ease-out data-[slot=open]:animate-in data-[slot=open]:zoom-in-97",
              "size-full p-4",
            )}
            data-slot={open ? "open" : "closed"}
          >
            <div className="grid gap-y-2">
              {navLinks.map((link) => (
                <Button
                  onClick={onNavigate}
                  asChild
                  className="w-full justify-start"
                  key={link.label}
                  variant="ghost"
                >
                  <Link {...(link.href ? { href: link.href } : { to: link.to })}>
                    <span className="max-sm:-ms-2">{link.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
            <Suspense fallback={null}>
              <MobileNavAuth onNavigate={onNavigate} />
            </Suspense>
          </div>
        </Portal>
      )}
    </div>
  );
}

function MobileNavAuth({ onNavigate }: { onNavigate: () => void }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const routerState = useRouterState();
  const { user } = useAuthSuspense();

  const redirect = routerState.location.search?.redirect;

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onResponse: async () => {
          await queryClient.invalidateQueries(getAuthUserQueryOptions());
          await router.invalidate();
          onNavigate();
        },
      },
    });
  };

  if (!user) {
    return (
      <div className="mt-12 flex flex-col gap-2">
        <Button onClick={onNavigate} asChild className="w-full" variant="outline">
          <Link to="/sign-in" search={redirect ? { redirect } : undefined}>
            Sign In
          </Link>
        </Button>
        <Button onClick={onNavigate} className="w-full" light="skeuomorphic" asChild>
          <Link to="/create-an-account" search={redirect ? { redirect } : undefined}>
            Get Started
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-col gap-6">
      <div className="border-t" />
      <div className="flex items-center gap-3 px-2">
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
      </div>
      <Button className="w-full" variant="destructive" onClick={handleSignOut}>
        <IconLogout aria-hidden="true" size={16} />
        Logout
      </Button>
    </div>
  );
}
