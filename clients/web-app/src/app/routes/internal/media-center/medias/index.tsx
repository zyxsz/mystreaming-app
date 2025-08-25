import type { Media } from "@/api/interfaces/media";
import type { Upload } from "@/api/interfaces/upload";
import { deleteMedia, getMedias } from "@/api/services/medias.service";
import { deleteUpload } from "@/api/services/uploads.service";
import { queryClient } from "@/app/root";
import { MediaStatus } from "@/components/badges/status/media-status";
import { AlertDialog } from "@/components/ui/alert-dialog-comp";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard, formatFileSize, secondsToTime } from "@/lib/utils";
import { apiClient } from "@/services/api";
import type { MediaGet, Pagination } from "@/types/app";
import { addSeconds, format, formatDistance, parseISO } from "date-fns";
import {
  ArrowRightIcon,
  CopyIcon,
  EllipsisIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export function meta() {
  return [{ title: "Medias | Media center | MyStreaming" }];
}

export default function Page() {
  const handleDelete = async (id: string) => {
    await deleteMedia(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <DataTable<Media>
        fetch={({ page }) => getMedias({ page })}
        generateKey={({ page }) => ["medias", page]}
        columns={[
          {
            isCheckBox: true,
          },
          {
            key: "video",
            content: {
              render(value) {
                return (
                  <Link
                    to={`/media-center/medias/${value.id}`}
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
              label: "Video",
            },
          },
          {
            key: "status",
            head: { label: "Status" },
            content: {
              render(value) {
                return value.status ? (
                  <MediaStatus status={value.status} />
                ) : (
                  "N/A"
                );
              },
            },
          },
          // {
          //   key: "duration",
          //   head: { label: "Duration" },
          //   content: {
          //     render(value) {
          //       return value.duration
          //         ? formatDistance(
          //             new Date(),
          //             addSeconds(new Date(), value.duration),
          //             { includeSeconds: true }
          //           )
          //         : "N/A";
          //     },
          //   },
          // },
          // {
          //   key: "upload",
          //   head: { label: "Upload" },
          //   content: {
          //     className: "max-w-48 overflow-hidden",
          //     render(value) {
          //       return value.upload ? (
          //         <Link
          //           className="flex items-center gap-2"
          //           to={`/media-center/uploads/${value.upload.id}`}
          //         >
          //           <UploadIcon className="shrink-0 size-4" />

          //           <span className="line-clamp-1 text-ellipsis">
          //             {value.upload.originalName}
          //           </span>
          //         </Link>
          //       ) : (
          //         "N/A"
          //       );
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
                    <MoreButton media={value} refetch={refetch} />
                  </div>
                );
              },
              className: "text-right py-2",
            },
          },
        ]}
        addButton={
          <Button size="sm" asChild>
            <Link to="/media-center/medias/new">
              New media <ArrowRightIcon />
            </Link>
          </Button>
        }
        deleteDialog={{
          title: "Are you sure?",
          description:
            "You really want to delete all the selected medias? This will delete permanently all the files related to it.",
        }}
        handleDelete={handleDelete}
        notFoundAddButton={
          <Button size="sm" asChild>
            <Link to="/media-center/medias/new">
              New media
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      />
    </div>
  );
}
export const MoreButton = ({
  media,
  refetch,
}: {
  media: Media;
  refetch?: () => void;
}) => {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleRemove = async () => {
    await deleteMedia(media.id)
      .then((data) => {
        console.log(data);
        toast.success("Yeeeep", {
          description:
            "Media removed successfully, all the files has been deleted from storage.",
        });
      })
      .catch((error) => {
        const message = error.message;
        toast.error("Opps", {
          description:
            message || "An error occurred while trying to remove this media",
        });
      })
      .finally(async () => {
        if (refetch) refetch();
        setIsRemoveDialogOpen(false);
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
        <DropdownMenuItem onClick={() => copyToClipboard(media.id)}>
          Copy ID
          <CopyIcon />
        </DropdownMenuItem>

        <AlertDialog
          dialogOpen={isRemoveDialogOpen}
          setDialogOpen={setIsRemoveDialogOpen}
          title="Are you sure?"
          description="You really want to delete this media? This will delete permanently all the records related to it."
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
