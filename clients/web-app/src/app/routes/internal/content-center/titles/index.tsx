import type { Title } from "@/api/interfaces/title";
import { getTitles } from "@/api/services/titles.service";
import { TitleType } from "@/components/badges/type/title-type";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { formatNumber, parseLanguage } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <DataTable<Title>
        fetch={({ page, search }) =>
          getTitles({ page, search: search || undefined })
        }
        generateKey={({ page, search }) => ["titles", page, search || null]}
        columns={[
          {
            isCheckBox: true,
          },
          {
            key: "name",
            content: {
              render(value) {
                return (
                  <Link
                    to={`/content-center/titles/${value.id}`}
                    className="line-clamp-1 text-ellipsis"
                  >
                    {value.name}
                  </Link>
                );
              },
              className:
                "max-w-82 min-w-32 whitespace-normal text-wrap overflow-hidden",
            },
            head: {
              label: "Name",
            },
          },
          {
            key: "originalLanguage",
            head: { label: "Original language" },
            content: {
              render(value) {
                return value.originalLanguage ? (
                  <span className="capitalize">
                    {parseLanguage(value.originalLanguage)}
                  </span>
                ) : (
                  "N/A"
                );
              },
            },
          },
          // {
          //   key: "tmdbId",
          //   head: { label: "Tmdb ID" },
          //   content: {
          //     render(value) {
          //       return value.tmdbId ? value.tmdbId : "N/A";
          //     },
          //   },
          // },
          // {
          //   key: "rating",
          //   head: { label: "Rating" },
          //   content: {
          //     render(value) {
          //       return value.rating ? formatNumber(value.rating) : "N/A";
          //     },
          //   },
          // },
          // {
          //   key: "popularity",
          //   head: { label: "Popularity" },
          //   content: {
          //     render(value) {
          //       return value.popularity
          //         ? formatNumber(value.popularity)
          //         : "N/A";
          //     },
          //   },
          // },

          {
            key: "type",
            head: { label: "Type" },
            content: {
              render(value) {
                return value.type ? <TitleType type={value.type} /> : "N/A";
              },
            },
          },
          {
            key: "releaseDate",
            head: { label: "Released at" },
            content: {
              render(value) {
                return value.releaseDate
                  ? format(
                      parseISO(value.releaseDate),
                      "MMMM dd',' yyyy hh:mm aaaaa'm'"
                    )
                  : "N/A";
              },
            },
          },
          {
            key: "createdAt",
            head: { label: "Created at" },
            content: {
              render(value) {
                return format(
                  parseISO(value.createdAt),
                  "MMMM dd',' yyyy hh:mm aaaaa'm'"
                );
              },
            },
          },
          // {
          //   key: "more",
          //   head: { label: "Actions", className: "text-right" },
          //   content: {
          //     render(value, refetch) {
          //       return (
          //         <div className="w-full flex justify-end">
          //           <MoreButton media={value} refetch={refetch} />
          //         </div>
          //       );
          //     },
          //     className: "text-right py-2",
          //   },
          // },
        ]}
        addButton={
          <Button size="sm" asChild>
            <Link to="/content-center/titles/new">
              New title <ArrowRightIcon />
            </Link>
          </Button>
        }
        deleteDialog={{
          title: "Are you sure?",
          description:
            "You really want to delete all the selected medias? This will delete permanently all the files related to it.",
        }}
        // handleDelete={handleDelete}
        notFoundAddButton={
          <Button size="sm" asChild>
            <Link to="/content-center/titles/new">
              New title
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      />
    </div>
  );
}
