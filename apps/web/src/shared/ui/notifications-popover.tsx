"use client";

import { BellIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Button } from "@tsu-stack/ui/components/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@tsu-stack/ui/components/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@tsu-stack/ui/components/popover";
import { ScrollArea } from "@tsu-stack/ui/components/scroll-area";
import { cn } from "@tsu-stack/ui/lib/utils";

type NotificationVariant = "info" | "success" | "warning" | "error";

type Notification = {
  id: number;
  variant: NotificationVariant;
  target: string;
  message: string;
  timestamp: string;
  unread: boolean;
};

const notificationsData: Notification[] = [
  {
    id: 1,
    variant: "error",
    target: "Deployments",
    message: "build failed on production - container exited with code 137",
    timestamp: "8 minutes ago",
    unread: true
  },
  {
    id: 2,
    variant: "warning",
    target: "Compute",
    message: "CPU usage on worker-03 exceeded 90% for the last 15 minutes",
    timestamp: "34 minutes ago",
    unread: true
  },
  {
    id: 3,
    variant: "success",
    target: "Deployments",
    message: "v2.4.1 rolled out to staging with all health checks passed",
    timestamp: "1 hour ago",
    unread: false
  },
  {
    id: 4,
    variant: "error",
    target: "API Keys",
    message: "production key sk_live_***f3a expires in 48 hours",
    timestamp: "3 hours ago",
    unread: false
  },
  {
    id: 5,
    variant: "info",
    target: "Integrations",
    message: "Datadog connected successfully and is now receiving metrics",
    timestamp: "Yesterday",
    unread: false
  },
  {
    id: 6,
    variant: "warning",
    target: "Storage",
    message: "database primary is at 87% disk capacity - consider scaling up",
    timestamp: "Yesterday",
    unread: false
  },
  {
    id: 7,
    variant: "success",
    target: "Cron Jobs",
    message: "nightly-backup completed in 4m 12s with 0 errors",
    timestamp: "2 days ago",
    unread: false
  },
  {
    id: 8,
    variant: "info",
    target: "Activity",
    message: "Alex Kim rotated 3 secrets in the production environment",
    timestamp: "3 days ago",
    unread: false
  }
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
        render={<Button aria-label="Open notifications" className="relative" size="icon-sm" variant="outline" />}
      >
        <BellIcon />
        {unreadCount > 0 && <Dot className="absolute -top-0.5 -right-0.5 size-2" />}
      </PopoverTrigger>
      <PopoverContent align="end" className="relative gap-0 overflow-hidden p-0 md:w-sm" side="bottom">
        <div className="flex h-12 items-center justify-between gap-4 border-b px-4 py-2">
          <div className="text-sm font-medium">Notifications</div>
          {unreadCount > 0 && (
            <Button className="text-xs font-medium" onClick={handleMarkAllAsRead} size="sm" variant="ghost">
              Mark all as read
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
                <EmptyTitle>No Notifications Yet</EmptyTitle>
                <EmptyDescription>You are all caught up. New alerts will appear here.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </ScrollArea>
      </PopoverContent>
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
        <p className="text-start font-mono text-[10px] text-muted-foreground">{notification.timestamp}</p>
        <p className="line-clamp-2 text-left text-xs font-medium text-muted-foreground">
          <span className="text-foreground hover:underline">{notification.target}</span>{" "}
          <span>{notification.message}</span>.
        </p>
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
