import type { Encode } from "@/api/interfaces/encode";
import { getEncodes } from "@/api/services/encodes.service";
import { EncodeStatus } from "@/components/badges/status/encode-status";
import { AlertDialog } from "@/components/ui/alert-dialog-comp";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VideoQualityBadge } from "@/components/ui/quality-badge";
import { copyToClipboard, formatFileSize, formatMoneyValue } from "@/lib/utils";
import { addSeconds, format, formatDistance, parseISO } from "date-fns";
import { CopyIcon, EllipsisIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Encodes | Media center | MyStreaming" }];
}

export default function Page() {
  const handleDelete = async (id: string) => {
    // await deleteMedia(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <DataTable<Encode>
        refetchIntervalInSeconds={15}
        fetch={({ page }) => getEncodes({ page })}
        generateKey={({ page }) => ["encodes", page]}
        columns={[
          {
            isCheckBox: true,
          },
          {
            key: "id",
            content: {
              render(value) {
                return (
                  <Link
                    to={`/media-center/medias/${value.id}`}
                    className="line-clamp-1 text-ellipsis"
                  >
                    {value.id.split("-")[4]}
                  </Link>
                );
              },
              className:
                "max-w-82 min-w-32 whitespace-normal text-wrap overflow-hidden",
            },
            head: {
              label: "ID",
            },
          },
          {
            key: "progress",
            head: { label: "Progress" },
            content: {
              render(value) {
                return value.progress ? `${value.progress.toFixed(2)}%` : "N/A";
              },
            },
          },
          {
            key: "status",
            head: { label: "Status" },
            content: {
              render(value) {
                return value.status ? (
                  <EncodeStatus status={value.status} />
                ) : (
                  "N/A"
                );
              },
            },
          },
          {
            key: "size",
            head: { label: "Size" },
            content: {
              render(value) {
                return value.size ? formatFileSize(value.size) : "N/A";
              },
            },
          },
          {
            key: "duration",
            head: { label: "Duration" },
            content: {
              render(value) {
                return value.duration
                  ? formatDistance(
                      new Date(),
                      addSeconds(new Date(), value.duration),
                      { includeSeconds: true }
                    )
                  : "N/A";
              },
            },
          },

          {
            key: "costInCents",
            head: { label: "Cost" },
            content: {
              render(value) {
                return value.costInCents
                  ? formatMoneyValue(value.costInCents / 100)
                  : "N/A";
              },
            },
          },

          {
            key: "videoQualities",
            head: { label: "Video qualities" },
            content: {
              render(value) {
                return value.videoQualities ? (
                  <div className="flex items-center gap-1">
                    {value.videoQualities.map((vq) => (
                      <VideoQualityBadge
                        key={`${value.id}-vq-${vq.quality}`}
                        quality={vq.quality}
                        encode={vq.encode}
                      />
                    ))}
                  </div>
                ) : (
                  "N/A"
                );
              },
            },
          },

          {
            key: "input",
            head: { label: "Input" },
            content: {
              className: "max-w-48 overflow-hidden",
              render(value) {
                return value.relations?.input ? (
                  <Link
                    className="flex items-center gap-2"
                    to={`/media-center/uploads/${value.relations.input.id}`}
                    title={value.relations.input.originalName}
                  >
                    <UploadIcon className="shrink-0 size-4" />

                    <span className="line-clamp-1 text-ellipsis">
                      {value.relations.input.originalName}
                    </span>
                  </Link>
                ) : (
                  "N/A"
                );
              },
            },
          },

          // {
          //   key: "Started at",
          //   head: { label: "Started At" },
          //   content: {
          //     render(value) {
          //       return value.startedAt
          //         ? format(
          //             parseISO(value.startedAt),
          //             "dd/MM/yyyy hh:mm aaaaa'm'"
          //           )
          //         : "N/A";
          //     },
          //   },
          // },
          // {
          //   key: "endedAt",
          //   head: { label: "Ended at" },
          //   content: {
          //     render(value) {
          //       return value.endedAt
          //         ? format(parseISO(value.endedAt), "dd/MM/yyyy hh:mm aaaaa'm'")
          //         : "N/A";
          //     },
          //   },
          // },

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
          {
            key: "more",
            head: { label: "Actions", className: "text-right" },
            content: {
              render(value, refetch) {
                return (
                  <div className="w-full flex justify-end">
                    <MoreButton encode={value} refetch={refetch} />
                  </div>
                );
              },
              className: "text-right py-2",
            },
          },
        ]}
        deleteDialog={{
          title: "Are you sure?",
          description:
            "You really want to delete all the selected encodes? This won't delete the files related to it.",
        }}
        handleDelete={handleDelete}
      />
    </div>
  );
}
export const MoreButton = ({
  encode,
  refetch,
}: {
  encode: Encode;
  refetch?: () => void;
}) => {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleRemove = async () => {
    // await deleteMedia(media.id)
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
    //         message || "An error occurred while trying to remove this media",
    //     });
    //   })
    //   .finally(async () => {
    //     if (refetch) refetch();
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
        <DropdownMenuItem onClick={() => copyToClipboard(encode.id)}>
          Copy ID
          <CopyIcon />
        </DropdownMenuItem>

        <AlertDialog
          dialogOpen={isRemoveDialogOpen}
          setDialogOpen={setIsRemoveDialogOpen}
          title="Are you sure?"
          description="You really want to delete this encode? This won't delete the records related to it."
          cancelButton="Cancel"
          actionButton="Continue"
          onAction={handleRemove}
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
