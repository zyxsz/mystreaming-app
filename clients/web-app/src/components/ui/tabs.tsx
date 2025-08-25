import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";
import { NavLink } from "react-router";
import { AnimatePresence, motion as m } from "motion/react";
import { Spinner } from "./spinner";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-app-secondary text-app-secondary-foreground-muted inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] border border-white/10",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "[&.active]:bg-app-primary data-[state=active]:bg-app-primary data-[state=active]:border-white/10 data-[state=active]:text-app-secondary-foreground inline-flex h-[calc(100%-1px)] data-[state=active]:font-medium flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1 text-sm font-normal whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-transparent transition-all cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

function TabsLinkList({
  children,
  className,
  ...rest
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-app-secondary text-app-secondary-foreground-muted inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] border border-white/10",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function TabLink({
  className,
  ...props
}: React.ComponentProps<typeof NavLink>) {
  return (
    <NavLink
      className={({ isActive, isPending, isTransitioning }) =>
        cn(
          "flex items-center justify-center h-[calc(100%-1px)] flex-1 rounded-lg border px-2 py-1 text-sm font-normal whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 border-transparent transition-colors cursor-pointer hover:text-app-secondary-foreground",
          isPending && "cursor-progress",
          isTransitioning && "bg-purple-500!",
          isActive &&
            "bg-app-primary border-white/10 text-app-secondary-foreground font-medium",
          className
        )
      }
      {...props}
    />
  );
}

function TabAnimatedSpinner(props: React.ComponentProps<typeof m.div>) {
  return (
    <m.div
      initial={{ marginLeft: 0, width: 0, opacity: 0 }}
      animate={{
        marginLeft: "0.5rem",
        width: "auto",
        opacity: 1,
      }}
      exit={{
        marginLeft: 0,
        width: 0,
        opacity: 0,
        transition: {
          marginLeft: { delay: 0.2 },
          width: { delay: 0.1 },
        },
      }}
      className="overflow-hidden"
      {...props}
    >
      <Spinner size={12} />
    </m.div>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabLink,
  TabsLinkList,
  TabAnimatedSpinner,
};
