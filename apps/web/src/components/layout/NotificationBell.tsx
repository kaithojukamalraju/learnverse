"use client";

import { useNotificationStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotificationStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold flex items-center justify-center text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 font-semibold text-sm">Notifications</div>
        <Separator />
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn("p-3 text-sm hover:bg-accent cursor-pointer transition-colors", !n.is_read && "bg-primary/5")}
                onClick={() => markRead(n.id)}
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-muted-foreground text-xs mt-1">{n.body}</p>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
