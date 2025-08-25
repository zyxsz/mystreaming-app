import type { Playback } from "@/api/interfaces/playback";
import { getMediaPlaybacks } from "@/api/services/medias.service";
import { MediaPlaybackStatus } from "@/components/badges/status/media-playback-status";
import { AlertDialog } from "@/components/ui/alert-dialog-comp";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard, secondsToTime } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  ArrowRightIcon,
  CopyIcon,
  EllipsisIcon,
  Trash2Icon,
} from "lucide-react";

import { Fragment, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/playbacks";

export default function Page({ params: { mediaId } }: Route.ComponentProps) {
  return (
    <DataTable<Playback>
      title={
        <h1 className="ml-2 text-base font-bold text-app-primary-foreground">
          Playbacks
        </h1>
      }
      columns={[
        {
          key: "id",
          head: {
            label: "ID",
          },
          content: {
            render(value) {
              return (
                <Link to={`/media-center/playbacks/${value.id}`}>
                  {value.id.split("-")[4]}
                </Link>
              );
            },
          },
        },
        {
          key: "user",
          head: {
            label: "User",
          },
          content: {
            render(value) {
              return value.relations?.user?.relations?.profile ? (
                <Fragment>
                  {value.relations?.user ? (
                    <Link
                      to={`/dashboard/users/${value.userId}`}
                      className="custom group"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar key={value.id + value.userId}>
                          <AvatarImage
                            src={
                              value.relations.user.relations.profile.avatarUrl
                            }
                            alt="value user's avatar"
                          />
                        </Avatar>
                        <div>
                          <h6 className="text-app-primary-foreground">
                            {value.relations.user.relations.profile.nickname}
                          </h6>
                          <p className="text-xs text-app-primary-foreground-muted group-hover:underline">
                            {value.relations.user.email}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Fragment>
                      {value.relations.user ? (
                        <Link to={`/dashboard/users/${value.userId}`}>
                          {value.relations.user.username}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </Fragment>
                  )}
                </Fragment>
              ) : (
                "N/A"
              );
            },
          },
        },
        {
          key: "status",
          head: {
            label: "Status",
          },
          content: {
            render(value) {
              return value.status ? (
                <MediaPlaybackStatus status={value.status} />
              ) : (
                "N/A"
              );
            },
          },
        },
        {
          key: "currentTime",
          head: {
            label: "Current time",
          },
          content: {
            render(value) {
              return value.currentTime
                ? secondsToTime(value.currentTime)
                : "N/A";
            },
          },
        },
        {
          key: "lastKeepAliveAt",
          head: {
            label: "Last keep alive",
          },
          content: {
            render(value) {
              return value.lastKeepAliveAt
                ? format(
                    parseISO(value.lastKeepAliveAt),
                    "MMMM dd',' hh:mm aaaaa'm'"
                  )
                : "N/A";
            },
          },
        },
        {
          key: "createdAt",
          head: {
            label: "Created at",
          },
          content: {
            render(value) {
              return value.createdAt
                ? format(parseISO(value.createdAt), "MMMM dd',' hh:mm aaaaa'm'")
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
                  <MoreButton playback={value} />
                </div>
              );
            },
            className: "text-right",
          },
        },
      ]}
      fetch={({ page }) => getMediaPlaybacks(mediaId, { page })}
      generateKey={({ page }) => ["media", mediaId, "playbacks", page]}
    />
  );
}

export const MoreButton = ({ playback }: { playback: Playback }) => {
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
        <DropdownMenuItem
          onClick={() => copyToClipboard(playback.userId!)}
          asChild
        >
          <Link to={`/media-center/playbacks/${playback.id}`}>
            Go to playback
            <ArrowRightIcon />
          </Link>
        </DropdownMenuItem>

        {playback.relations?.user && (
          <DropdownMenuItem
            onClick={() => copyToClipboard(playback.userId!)}
            asChild
          >
            <Link to={`/admin/users/${playback.relations.user.id}`}>
              Go to user
              <ArrowRightIcon />
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => copyToClipboard(playback.id)}>
          Copy ID
          <CopyIcon />
        </DropdownMenuItem>

        {playback.relations?.user && (
          <DropdownMenuItem onClick={() => copyToClipboard(playback.userId!)}>
            Copy userId
            <CopyIcon />
          </DropdownMenuItem>
        )}

        <AlertDialog
          dialogOpen={isRemoveDialogOpen}
          setDialogOpen={setIsRemoveDialogOpen}
          title="Are you sure?"
          description="You really want to delete this playback? This will delete permanently all the records related to it."
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
