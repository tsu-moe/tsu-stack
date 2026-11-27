"use client";

import { UserIcon, SettingsIcon, CreditCardIcon, LogOutIcon } from "lucide-react";

import { type AuthQueryResult } from "@tsu-stack/auth/react/tanstack-start/queries";
import { m } from "@tsu-stack/i18n/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@tsu-stack/ui/components/avatar";
import { Button } from "@tsu-stack/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@tsu-stack/ui/components/dropdown-menu";

export function NavUser({ user, onSignOut }: { user: NonNullable<AuthQueryResult>; onSignOut?: () => void }) {
  const initial = (user.name.trim().at(0) ?? user.email.at(0))?.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={m.user_dropdown__open_menu()}
        render={<Button type="button" size="icon-sm" radius="full" variant="ghost" />}
      >
        <Avatar aria-hidden="true">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="pointer-events-none flex items-center gap-2">
            <Avatar className="isolate size-8">
              {user.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium text-foreground">{user.name}</span> <br />
              <div className="max-w-full overflow-hidden text-xs text-ellipsis whitespace-nowrap text-muted-foreground">
                {user.email}
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon />
            {m.user_dropdown__account()}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon />
            {m.dashboard_nav__settings()}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CreditCardIcon />
            {m.user_dropdown__billing()}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={onSignOut}>
            <LogOutIcon />
            {m.user_dropdown__logout()}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
