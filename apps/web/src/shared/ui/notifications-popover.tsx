"use client";

import { BellIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { m } from "@tsu-stack/i18n/messages";
import { Button } from "@tsu-stack/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@tsu-stack/ui/components/empty";
import { Popover, PopoverPopup, PopoverTrigger } from "@tsu-stack/ui/components/popover";
import { ScrollArea } from "@tsu-stack/ui/components/scroll-area";
import { cn } from "@tsu-stack/ui/lib/utils";

type NotificationVariant = "info" | "success" | "warning" | "error";

type Notification = {
  id: number;
  variant: NotificationVariant;
  message: () => string;
  unread: boolean;
};

const notificationsData: Notification[] = [
  { id: 1, variant: "info", message: m.dashboard_notifications__start, unread: true },
  { id: 2, variant: "info", message: m.dashboard_notifications__validate, unread: true }
];

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState(notificationsData);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => {
        return {
          ...notification,
          unread: false
        };
      })
    );
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, unread: false } : notification))
    );
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label={m.dashboard_notifications__open()}
            className="relative"
            size="icon-sm"
            variant="outline"
          />
        }
      >
        <BellIcon />
        {unreadCount > 0 && <Dot className="absolute -top-0.5 -right-0.5 size-2" />}
      </PopoverTrigger>
      <PopoverPopup align="end" className="relative gap-0 overflow-hidden p-0 md:w-sm" side="bottom">
        <div className="flex h-12 items-center justify-between gap-4 border-b px-4 py-2">
          <div className="text-sm font-medium">{m.dashboard_notifications__title()}</div>
          {unreadCount > 0 && (
            <Button className="text-xs font-medium" onClick={handleMarkAllAsRead} size="sm" variant="ghost">
              {m.dashboard_notifications__mark_all_read()}
            </Button>
          )}
        </div>
        <ScrollArea className="no-scrollbar scroll-fade h-full max-h-100 min-h-80 overflow-y-auto bg-background">
          {notifications.length > 0 ? (
            <div className="flex flex-col gap-px bg-border">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification.id)}
                />
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BellIcon />
                </EmptyMedia>
                <EmptyTitle>{m.dashboard_notifications__empty()}</EmptyTitle>
                <EmptyDescription>{m.dashboard_notifications__empty_description()}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </ScrollArea>
      </PopoverPopup>
    </Popover>
  );
}

function NotificationItem({
  notification,
  className,
  ...props
}: React.ComponentProps<"button"> & { notification: Notification }) {
  return (
    <button
      className={cn(
        "relative flex size-full h-16 items-center justify-start bg-background outline-none",
        "hover:bg-muted dark:hover:bg-muted/75",
        "focus-visible:ring-3 focus-visible:ring-border",
        "transition-[margin] duration-100",
        notification.unread && "bg-background/75",
        className
      )}
      data-state={notification.unread ? "unread" : "read"}
      {...props}
    >
      <div className="flex h-full w-12 items-center justify-center">
        <NotificationItemIcon variant={notification.variant} />
      </div>
      <div className="flex-1 space-y-0.5 ps-1 pe-6">
        <p className="text-start font-mono text-[10px] text-muted-foreground">{m.dashboard_notifications__starter()}</p>
        <p className="line-clamp-2 text-left text-xs font-medium text-muted-foreground">{notification.message()}</p>
      </div>
    </button>
  );
}

function NotificationItemIcon({ variant }: { variant: NotificationVariant }) {
  const colorMap = {
    error: "text-destructive",
    success: "text-emerald-500",
    warning: "text-yellow-500",
    info: "text-blue-500"
  };

  switch (variant) {
    case "success":
      return <CircleCheckIcon className={cn("size-4", colorMap[variant])} />;
    case "info":
      return <InfoIcon className={cn("size-4", colorMap[variant])} />;
    case "warning":
      return <TriangleAlertIcon className={cn("size-4", colorMap[variant])} />;
    case "error":
      return <OctagonXIcon className={cn("size-4", colorMap[variant])} />;
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}

function Dot({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("size-2 rounded-full bg-primary", className)} {...props} />;
}
