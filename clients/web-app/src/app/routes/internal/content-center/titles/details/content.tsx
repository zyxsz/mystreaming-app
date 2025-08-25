import { DataTable } from "@/components/ui/data-table";
import type { Route } from "./+types/content";
import { getTitleMediaAssigns } from "@/api/services/titles.service";
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
import {
  ArrowRightIcon,
  EllipsisIcon,
  PlusCircleIcon,
  Trash2Icon,
} from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog-comp";
import { deleteMediaAssign } from "@/api/services/medias.service";
import { toast } from "sonner";

export default function Page({ params: { titleId } }: Route.ComponentProps) {
  return (
    <div className="">
      <DataTable
        title={
          <h1 className="ml-2 text-base font-bold text-app-primary-foreground">
            Media assigns
          </h1>
        }
        addButton={
          <Button size="sm" asChild>
            <Link to={`/content-center/titles/${titleId}/content/add`}>
              Add content <PlusCircleIcon />
            </Link>
          </Button>
        }
        fetch={({ page }) => getTitleMediaAssigns(titleId, { page })}
        generateKey={({ page, search }) => [
          "titles",
          titleId,
          "media-assigns",
          page,
          search || null,
        ]}
        columns={[
          {
            head: { label: "Assigned by" },
            content: {
              render(value, refetch) {
                return value.relations?.assignedBy ? (
                  <Fragment>
                    {value.relations.assignedBy.relations?.profile ? (
                      <Link
                        to={`/dashboard/users/${value.relations.assignedBy.id}`}
                        className="custom group"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar
                            key={value.id + value.relations.assignedBy.id}
                          >
                            <AvatarImage
                              src={
                                value.relations.assignedBy.relations.profile
                                  .avatarUrl
                              }
                              alt="value user's avatar"
                            />
                          </Avatar>
                          <div className="">
                            <h6 className="text-app-primary-foreground">
                              {
                                value.relations.assignedBy.relations.profile
                                  .nickname
                              }
                            </h6>
                            <p className="text-xs text-app-primary-foreground-muted group-hover:underline">
                              {value.relations.assignedBy.email}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        to={`/d/users/${value.relations.assignedBy.id}`}
                        className="group flex items-center gap-2 custom"
                      >
                        <p className="group-hover:underline">
                          {value.relations.assignedBy.username}
                        </p>
                        <UserRole role={value.relations.assignedBy.role} />
                      </Link>
                    )}
                  </Fragment>
                ) : (
                  "N/A"
                );
              },
            },
          },

          {
            head: { label: "Media" },
            content: {
              render(value, refetch) {
                return value.relations?.media ? (
                  <Link to={`/media-center/medias/${value.relations.media.id}`}>
                    {value.relations.media.name}
                  </Link>
                ) : (
                  "N/A"
                );
              },
            },
          },
          {
            head: { label: "Episode" },
            content: {
              render(value, refetch) {
                return value.relations?.episode ? (
                  <Link
                    to={`/content-center/episodes/${value.relations.episode.id}`}
                  >
                    {value.relations.episode.name}
                  </Link>
                ) : (
                  "N/A"
                );
              },
            },
          },

          {
            head: { label: "Assigned at" },
            content: {
              render(value, refetch) {
                return value.assignedAt
                  ? format(
                      parseISO(value.assignedAt),
                      "MMMM dd',' yyyy hh:mm aaaaa'm'"
                    )
                  : "N/A";
              },
            },
          },
          {
            key: "more",
            head: { label: "Actions", className: "text-right" },
            content: {
              render(value, refetch) {
                return (
                  <div className="w-full flex justify-end">
                    <MoreButton data={value} refetch={refetch} />
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

export const MoreButton = ({
  data,
  refetch,
}: {
  data: MediaAssign;
  refetch?: () => void;
}) => {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleRemove = async () => {
    await deleteMediaAssign(data.mediaId, data.id)
      .then((data) => {
        console.log(data);
        toast.success("Yeeeep", {
          description: "Media assign removed successfully.",
        });
      })
      .catch((error) => {
        const message = error.message;
        toast.error("Opps", {
          description:
            message ||
            "An error occurred while trying to remove this media assign",
        });
      })
      .finally(() => {
        refetch?.();
      });
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
        <DropdownMenuItem asChild>
          <Link to={`/media-center/medias/${data.mediaId}`}>
            Go to media
            <ArrowRightIcon />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/data-center/users/${data.assignedBy}`}>
            Go to user
            <ArrowRightIcon />
          </Link>
        </DropdownMenuItem>
        {data.episodeId && (
          <DropdownMenuItem asChild>
            <Link to={`/content-center/episodes/${data.episodeId}`}>
              Go to episode
              <ArrowRightIcon />
            </Link>
          </DropdownMenuItem>
        )}

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
