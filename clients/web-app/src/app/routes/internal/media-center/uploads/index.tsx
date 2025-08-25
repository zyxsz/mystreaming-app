import type { Upload } from "@/api/interfaces/upload";
import { deleteUpload, getUploads } from "@/api/services/uploads.service";
import { queryClient } from "@/app/root";
import { UploadStatus } from "@/components/badges/status/upload-status";
import { AlertDialog } from "@/components/ui/alert-dialog-comp";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard, formatFileSize } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  ArrowRightIcon,
  CopyIcon,
  EllipsisIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function Page() {
  const handleDelete = async (id: string) => {
    await deleteUpload(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <DataTable<Upload>
        fetch={({ page }) => getUploads({ page })}
        generateKey={({ page }) => ["uploads", page]}
        columns={[
          {
            isCheckBox: true,
          },
          {
            key: "id",
            content: {
              render(value) {
                return value.id.split("-")[4];
              },
              className:
                "max-w-82 min-w-32 whitespace-normal text-wrap overflow-hidden",
            },
            head: {
              label: "ID",
            },
          },
          {
            key: "name",
            head: { label: "Name" },
            content: {
              render(value) {
                return <span>{value.originalName}</span>;
              },
              className:
                "max-w-82 min-w-32 whitespace-normal text-wrap overflow-hidden",
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
            key: "status",
            head: { label: "Status" },
            content: {
              render(value) {
                return value.status ? (
                  <UploadStatus status={value.status} />
                ) : (
                  "N/A"
                );
              },
            },
          },
          {
            key: "type",
            head: { label: "Type" },
            content: {
              className: "max-w-48 overflow-hidden",
              render(value) {
                return value.type ? (
                  <span className="line-clamp-1 text-ellipsis">
                    {value.type}
                  </span>
                ) : (
                  "N/A"
                );
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

          {
            key: "more",
            head: { label: "Actions", className: "text-right" },
            content: {
              render(value, refetch) {
                return (
                  <div className="w-full flex justify-end">
                    <MoreButton upload={value} refetch={refetch} />
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
            "You really want to delete all the selected medias? This will delete permanently all the files related to it.",
        }}
        addButton={
          <Button size="sm" asChild>
            <Link to="/media-center/uploads/new">
              New upload <ArrowRightIcon />
            </Link>
          </Button>
        }
        handleDelete={handleDelete}
        notFoundAddButton={
          <Button size="sm" asChild>
            <Link to="/media-center/uploads/new">
              New upload
              <ArrowRightIcon />
            </Link>
          </Button>
        }
      />
    </div>
  );
}

export const MoreButton = ({
  upload,
  refetch,
}: {
  upload: Upload;
  refetch?: () => void;
}) => {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleRemove = async () => {
    await deleteUpload(upload.id)
      .then((data) => {
        console.log(data);
        toast.success("Yeeeep", {
          description:
            "Upload removed successfully, all the files has been deleted from storage.",
        });
      })
      .catch((error) => {
        const message = error.message;
        toast.error("Opps", {
          description:
            message || "An error occurred while trying to remove this upload",
        });
      })
      .finally(async () => {
        if (refetch) refetch();
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
        <DropdownMenuItem onClick={() => copyToClipboard(upload.id)}>
          Copy ID
          <CopyIcon />
        </DropdownMenuItem>

        <AlertDialog
          dialogOpen={isRemoveDialogOpen}
          setDialogOpen={setIsRemoveDialogOpen}
          title="Are you sure?"
          description="You really want to delete this upload? This will delete permanently all the records related to it."
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
