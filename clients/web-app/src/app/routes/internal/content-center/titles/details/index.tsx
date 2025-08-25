import { useQuery } from "@tanstack/react-query";
import type { Route } from "./+types/index";
import { getTitle } from "@/api/services/titles.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { TitleType } from "@/components/badges/type/title-type";
import { parseLanguage } from "@/lib/utils";
import {
  TabAnimatedSpinner,
  TabLink,
  TabsLinkList,
} from "@/components/ui/tabs";
import { Fragment } from "react/jsx-runtime";
import { AnimatePresence } from "motion/react";
import { Outlet } from "react-router";
import { GoBackButton } from "@/components/ui/go-back-button";
import { ArrowLeftIcon } from "lucide-react";

export default function Page({ params: { titleId } }: Route.ComponentProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["titles", titleId],
    queryFn: () => getTitle(titleId),
  });

  if (isLoading || !data) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Original language</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Released date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{data.id.split("-")[4]}</TableCell>
            <TableCell>{data.name || "N/A"}</TableCell>
            <TableCell>
              {data.originalLanguage
                ? parseLanguage(data.originalLanguage)
                : "N/A"}
            </TableCell>
            <TableCell>
              {data.type ? <TitleType type={data.type} /> : "N/A"}
            </TableCell>
            <TableCell>
              {data.releaseDate
                ? format(
                    parseISO(data.releaseDate),
                    "MMMM dd',' yyyy hh:mm aaaaa'm'"
                  )
                : "N/A"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table> */}

      <div className="w-full space-y-6">
        <TabsLinkList className="w-full justify-start">
          <TabLink className="flex-0 px-2" to={`/content-center/titles`} end>
            {({ isPending }) => (
              <Fragment>
                <ArrowLeftIcon />
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>

          <TabLink
            className="flex-0 px-4"
            to={`/content-center/titles/${titleId}`}
            end
          >
            {({ isPending }) => (
              <Fragment>
                Content
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>

          <TabLink
            className="flex-0 px-4"
            to={`/content-center/titles/${titleId}/seasons`}
            end
          >
            {({ isPending }) => (
              <Fragment>
                Seasons
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
          <TabLink
            className="flex-0 px-4"
            to={`/content-center/titles/${titleId}/progress`}
            end
          >
            {({ isPending }) => (
              <Fragment>
                Progress
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
          <TabLink
            className="flex-0 px-4"
            to={`/content-center/titles/${titleId}/images`}
            end
          >
            {({ isPending }) => (
              <Fragment>
                Images
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
          <TabLink
            className="flex-0 px-4"
            to={`/content-center/titles/${titleId}/trailers`}
            end
          >
            {({ isPending }) => (
              <Fragment>
                Trailers
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
        </TabsLinkList>
        <Outlet />
      </div>
    </div>
  );
}
