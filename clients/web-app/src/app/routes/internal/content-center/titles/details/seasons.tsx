import { DataTable } from "@/components/ui/data-table";
import type { Route } from "./+types/content";
import {
  getTitleMediaAssigns,
  getTitleSeasons,
} from "@/api/services/titles.service";
import { format, parseISO } from "date-fns";
import { Link } from "react-router";
import { UserRole } from "@/components/badges/user-role";
import { Fragment } from "react/jsx-runtime";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { MediaStatus } from "@/components/badges/status/media-status";
import { useState } from "react";
import type { MediaAssign } from "@/api/interfaces/media-assign";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, EllipsisIcon, Trash2Icon } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog-comp";
import type { Season } from "@/api/interfaces/season";

export default function Page({ params: { titleId } }: Route.ComponentProps) {
  return (
    <div className="">
      <DataTable
        title={
          <h1 className="ml-2 text-base font-bold text-app-primary-foreground">
            Seasons
          </h1>
        }
        fetch={({ page }) => getTitleSeasons(titleId, { page })}
        generateKey={({ page, search }) => [
          "titles",
          titleId,
          "seasons",
          page,
          search || null,
        ]}
        columns={[
          {
            head: { label: "ID" },
            content: {
              render(value, refetch) {
                return (
                  <Link to={`/content-center/seasons/${value.id}`}>
                    {value.id.split("-")[4]}
                  </Link>
                );
              },
            },
          },
          {
            head: { label: "Name" },
            content: {
              render(value, refetch) {
                return value.name ? value.name : "N/A";
              },
            },
          },
          {
            head: { label: "Rating" },
            content: {
              render(value, refetch) {
                return value.rating ? value.rating : "N/A";
              },
            },
          },

          {
            head: { label: "Overview" },
            content: {
              render(value, refetch) {
                return (
                  <span className="line-clamp-1" title={value.overview}>
                    {value.overview ? value.overview : "N/A"}
                  </span>
                );
              },
              className:
                "max-w-58 min-w-32 whitespace-normal text-wrap overflow-hidden",
            },
          },

          {
            head: { label: "Number" },
            content: {
              render(value, refetch) {
                return value.number ? value.number : "N/A";
              },
            },
          },

          {
            head: { label: "Air date" },
            content: {
              render(value, refetch) {
                return value.airDate
                  ? format(
                      parseISO(value.airDate),
                      "MMMM dd',' yyyy" //hh:mm aaaaa'm'
                    )
                  : "N/A";
              },
            },
          },
          {
            key: "more",
            head: { label: "Actions", className: "text-right" },
            content: {
              render(value) {
                return (
                  <div className="w-full flex justify-end">
                    <MoreButton data={value} />
                  </div>
                );
              },
              className: "text-right",
            },
          },
        ]}
      />
    </div>
  );
}

export const MoreButton = ({ data }: { data: Season }) => {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleRemove = async () => {
    // await StreamingApi.medias
    //   .remove(media.id)
    //   .then((data) => {
    //     console.log(data);
    //     toast.success("Yeeeep", {
    //       description:
    //         "Media removed successfully, all the files has been deleted from storage.",
    //     });
    //   })
    //   .catch((error) => {
    //     const message = error.message;
    //     toast.error("Opps", {
    //       description:
    //         message || "An error occured while trying to remove this media",
    //     });
    //   })
    //   .finally(async () => {
    //     await refetch();
    //   });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="iconXs">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        // side='left'
        sideOffset={8}
        align="end"
        className="z-999 min-w-48"
      >
        <AlertDialog
          dialogOpen={isRemoveDialogOpen}
          setDialogOpen={setIsRemoveDialogOpen}
          title="Are you sure?"
          description="You really want to delete this record? This will delete permanently all the records related to it."
          cancelButton="Cancel"
          actionButton="Continue"
          onAction={handleRemove}
          // onAction={() => handleDenyFriend(user)}
          asChild
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setIsRemoveDialogOpen(true);
            }}
          >
            Delete
            <Trash2Icon />
          </DropdownMenuItem>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
