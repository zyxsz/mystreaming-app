import { keepPreviousData, useQuery } from "@tanstack/react-query";
import lodash from "lodash";
import { parseAsInteger, useQueryState } from "nuqs";
import { Fragment, useCallback, useState, type ReactNode } from "react";
import { Button } from "./button";
import { AlertDialog } from "./alert-dialog-comp";
import { ArrowRightIcon, RefreshCcw, SearchX, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Checkbox } from "./checkbox";
import type { ClassValue } from "clsx";
import { PaginationContainer } from "./pagination";
import { mapLimit } from "async";
import { toast } from "sonner";
import { LoadingContainer } from "./loading-container";
import type { Pagination } from "@/api/interfaces/pagination";

const throttle = lodash.throttle;

type PaginationData = { page: number; search?: string | null };

type Props<T extends { id: string }, K = keyof T> = {
  generateKey: (data: PaginationData) => (string | number | null)[];
  fetch: (data: PaginationData) => Promise<Pagination<T>>;
  columns: {
    key?: K | string;
    isCheckBox?: boolean;

    head?: {
      label?: ReactNode;
      className?: ClassValue;
    };

    content?: {
      render?: (value: T, refetch?: () => void) => ReactNode;
      className?: ClassValue;
    };
  }[];
  deleteDialog?: {
    title?: ReactNode;
    description?: ReactNode;
  };
  handleDelete?: (id: string) => Promise<void>;
  addButton?: ReactNode;
  title?: ReactNode;
  refetchIntervalInSeconds?: number;
  notFoundContainer?: ReactNode;
  notFoundAddButton?: ReactNode;
  footerChildren?: ReactNode;
};

let searchTimeout: NodeJS.Timeout;

export const DataTable = <T extends { id: string }, K = keyof T>({
  generateKey,
  fetch,
  columns,
  addButton,
  deleteDialog,
  handleDelete,
  title,
  refetchIntervalInSeconds,
  notFoundContainer,
  notFoundAddButton,
  footerChildren,
}: Props<T, K>) => {
  const [page, setPage] = useQueryState<number>(
    "page",
    parseAsInteger.withDefault(1)
  );

  const [search, setSearch] = useQueryState("search");
  const [selected, setSelected] = useState<T[]>([]);

  const {
    data: response,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: generateKey({ page, search }),
    queryFn: () => fetch({ page, search }),
    placeholderData: keepPreviousData,
    refetchInterval: refetchIntervalInSeconds
      ? refetchIntervalInSeconds * 1000
      : undefined,
  });

  const handleSearch = (query: string | null) => {
    if (searchTimeout) clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      setSearch(query);
    }, 500);
  };

  if (isLoading) return <LoadingContainer />;
  if (!response) return <LoadingContainer />;

  const pageSize = response.pagination.size;
  const totalPages = response.pagination.totalPages;

  const handleSelectAll = () => {
    setSelected((state) =>
      state.length === response.data.length ? [] : response.data
    );
  };

  const handleSelect = (v: T) => {
    setSelected((state) =>
      state.find((s) => v.id === s.id)
        ? state.filter((s) => v.id !== s.id)
        : [...state, v]
    );
  };

  const handleRemoveSelected = async () => {
    if (!handleDelete) return;

    const results = (
      await mapLimit(selected, 1, async (value: (typeof selected)[0]) => {
        const r = await handleDelete(value.id)
          .then(() => true)
          .catch((error) => {
            const message = error.message;
            toast.error("Opps", {
              description: message || (
                <Fragment>
                  An error occurred while trying to remove the record{" "}
                  <strong>{value.id}</strong>
                </Fragment>
              ),
            });
            return false;
          });
        return r;
      })
    ).filter((r) => r === true).length;

    toast.success("Yeeeep", {
      description: `${results} records removed successfully`,
    });
    await refetch();
  };

  return (
    <Fragment>
      {/* {response.data.length > 0 ? ( */}
      <div className="flex flex-col gap-2">
        {title === null ? null : (
          <header className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              {title ? (
                <Fragment>
                  {title}
                  <p className="ml-2 text-sm text-app-primary-foreground-muted">
                    Showing {response.data.length}{" "}
                    {response.data.length === 1 ? "row" : "rows"}
                  </p>
                </Fragment>
              ) : (
                <Fragment>
                  <input
                    placeholder="Search..."
                    className="py-2 px-4 text-xs gap-2 [&_svg]:size-4 rounded-lg bg-app-primary-button hover:bg-app-primary-button-hover border border-white/10 outline-none hover:border-white/25 focus:border-white/25 transition-all"
                    onChange={(e) => handleSearch(e.target.value || null)}
                  />
                  <Button size="sm" disabled>
                    Filters
                  </Button>
                  {deleteDialog && (
                    <AlertDialog
                      title={deleteDialog.title || "Are you sure?"}
                      description={deleteDialog.description}
                      cancelButton="Cancel"
                      actionButton="Continue"
                      onAction={handleRemoveSelected}
                      // onAction={() => handleDenyFriend(user)}
                      asChild
                    >
                      <Button size="sm" disabled={selected.length <= 0}>
                        <TrashIcon />
                      </Button>
                    </AlertDialog>
                  )}

                  <p className="ml-2 text-sm text-app-primary-foreground-muted">
                    Selected {selected.length} of {response.data.length} rows
                  </p>
                </Fragment>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button size="sm" onClick={() => refetch()}>
                <RefreshCcw className={cn(isFetching && "animate-spin")} />
              </Button>
              {addButton && addButton}
              {/* <Button size="sm" asChild>
                <Link to={`/media-center/uploads/add`}>
                  Add upload <ArrowRightIcon />
                </Link>
              </Button> */}
            </div>
          </header>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => {
                if (column.isCheckBox)
                  return (
                    <TableHead
                      key={`${column.key as string}-${index}`}
                      className="text-center align-middle"
                    >
                      <Checkbox
                        onClick={() => handleSelectAll()}
                        checked={selected.length === response.data.length}
                      />
                    </TableHead>
                  );

                if (column.head?.label)
                  return (
                    <TableHead
                      className={cn(column.head.className)}
                      key={`${column.key as string}-${index}`}
                    >
                      {column.head.label}
                    </TableHead>
                  );

                return null;
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {response.data.map((value) => {
              return (
                <TableRow key={value.id}>
                  {columns.map((column, index) => {
                    if (column.isCheckBox)
                      return (
                        <TableCell
                          key={`${column.key as string}-${index}-${value.id}`}
                          className="text-center align-middle"
                        >
                          <Checkbox
                            onClick={() => handleSelect(value)}
                            checked={!!selected.find((s) => s.id === value.id)}
                          />
                        </TableCell>
                      );

                    if (column.content?.render)
                      return (
                        <TableCell
                          className={cn(column.content.className)}
                          key={`${column.key as string}-${index}-${value.id}`}
                        >
                          {column.content.render(value, refetch)}
                        </TableCell>
                      );

                    return null;
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {response.data.length <= 0 && (
          <Fragment>
            {notFoundContainer ? (
              notFoundContainer
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                {/* <SearchX className="size-12" /> */}
                <h2 className="text-lg font-bold text-app-primary-foreground">
                  Oopppps...
                </h2>
                <p className="text-sm text-app-primary-foreground-muted">
                  Apparently there is no record registered yet.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm" onClick={() => refetch()}>
                    <RefreshCcw className={cn(isFetching && "animate-spin")} />
                    Refresh
                  </Button>
                  {notFoundAddButton}
                </div>
              </div>
            )}
          </Fragment>
        )}

        <footer
          className={cn(
            "mt-2 w-full flex items-center justify-end gap-4",
            footerChildren && "justify-between"
          )}
        >
          {footerChildren}
          <div className="flex items-center justify-end gap-4">
            <p className="text-xs text-app-primary-foreground-muted">
              Showing{" "}
              <strong className="text-app-primary-foreground">
                {pageSize}
              </strong>{" "}
              results per page
            </p>
            <PaginationContainer
              onPageChange={setPage}
              page={page}
              totalPages={totalPages}
            />
          </div>
        </footer>
      </div>
      {/* ) : (
        <Fragment>
          {notFoundContainer ? (
            notFoundContainer
          ) : (
            <div className="flex flex-col items-center justify-center min-h-62">
              <SearchX className="size-12" />
              <h2 className="mt-2 text-lg font-bold text-app-primary-foreground">
                Oopppps...
              </h2>
              <p className="text-sm text-app-primary-foreground-muted">
                Apparently there is no record registered yet.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" onClick={() => refetch()}>
                  <RefreshCcw className={cn(isFetching && "animate-spin")} />
                  Refresh
                </Button>
                {notFoundAddButton}
              </div>
            </div>
          )}
        </Fragment>
      )} */}
    </Fragment>
  );
};
