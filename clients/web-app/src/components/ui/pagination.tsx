import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import type { Button } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  asChild?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"button">;

function PaginationLink({
  className,
  isActive,
  asChild,
  ...props
}: PaginationLinkProps) {
  const Element = asChild ? Slot : "button";

  return (
    <Element
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "border border-white/10 flex items-center justify-center gap-2 text-xs p-2 bg-transparent rounded-md min-w-8 [&_svg]:size-4 hover:bg-app-secondary hover:shadow cursor-pointer transition-all",
        "disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none",
        isActive && "bg-app-secondary shadow cursor-default",
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

const PaginationContainer = ({
  page,
  onPageChange,
  totalPages,
}: {
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}) => {
  return (
    <Pagination className="w-auto mx-0 text-foreground-muted font-normal">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={page - 1 < 1}
            onClick={() => onPageChange(1)}
          ></PaginationPrevious>
        </PaginationItem>
        {page > 3 && (
          <PaginationItem>
            <PaginationLink asChild>
              <button onClick={() => onPageChange(1)}>1</button>
            </PaginationLink>
          </PaginationItem>
        )}
        {page - 1 > 0 && (
          <PaginationItem>
            <PaginationLink asChild>
              <button onClick={() => onPageChange(page - 1)}>{page - 1}</button>
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink isActive>{page}</PaginationLink>
        </PaginationItem>
        {page + 1 <= totalPages && (
          <PaginationItem>
            <PaginationLink asChild>
              <button onClick={() => onPageChange(page + 1)}>{page + 1}</button>
            </PaginationLink>
          </PaginationItem>
        )}

        {page < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink asChild>
              <button onClick={() => onPageChange(totalPages)}>
                {totalPages}
              </button>
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            disabled={page + 1 > totalPages}
            onClick={() => onPageChange(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationContainer,
};
