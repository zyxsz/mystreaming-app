import { FileInput } from "@/components/fields/file-input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFileSize } from "@/lib/utils";
import { uploadStore } from "@/stores/upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CopyIcon, EllipsisIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Fragment, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  files: z.array(
    z
      .instanceof(File, { message: "Video is required" })
      .refine((file) => !file || file.size !== 0 || file.size <= 3000000000, {
        message: "Max size exceeded",
      })
  ),
});

export default function Page() {
  const navigate = useNavigate();
  const [filesPreview, setFilesPreview] = useState<File[]>([]);
  const [isUploadingPending, startUploadTransition] = useTransition();

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    const subscription = watch((data) => {
      if (!data.files) return;

      setFilesPreview(data.files as File[]);
    });

    return subscription.unsubscribe;
  }, []);

  const onSubmit = (data: z.infer<typeof schema>) => {
    startUploadTransition(async () => {
      await uploadStore.getState().uploadFiles(data.files);

      toast.success("Yeeeep", { description: "Upload completed successfully" });

      navigate("/media-center/uploads");
    });
  };

  const handleRemoveFile = (file: File) => {
    setValue(
      "files",
      getValues("files")?.filter((f) => f.name !== file.name)
    );
  };

  const handleCancel = () => {
    navigate("/media-center/uploads");
  };

  return (
    <div className="w-full max-w-screen-lg">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          handleSubmit(onSubmit)(e);
        }}
      >
        <FileInput
          id="files"
          className="hidden"
          control={control}
          name="files"
          accept="video/*,.mkv"
          multiple
        />
        <label
          htmlFor="files"
          className="w-full py-20 flex flex-col items-center justify-center bg-app-primary-button hover:bg-app-primary-button-hover rounded-2xl border border-dashed border-white/10 cursor-pointer transition-all"
        >
          <UploadIcon className="size-10 text-app-secondary-foreground" />
          <h1 className="mt-2 text-base font-bold text-app-secondary-foreground">
            Select files to upload...
          </h1>
          <p className="text-sm text-app-secondary-foreground-muted">
            Only videos accepted, max file size: 5GB
          </p>
        </label>

        {filesPreview.length > 0 && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filesPreview.map((file) => (
                  <FileRow
                    key={file.name}
                    file={file}
                    handleRemoveFile={handleRemoveFile}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex items-center justify-end gap-4">
          <Button
            variant="link"
            type="button"
            onClick={handleCancel}
            disabled={isUploadingPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUploadingPending}>
            {isUploadingPending ? (
              <Fragment>
                <Spinner size={16} /> Uploading...
              </Fragment>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

const FileRow = ({
  file,
  handleRemoveFile,
}: {
  file: File;
  handleRemoveFile: (file: File) => void;
}) => {
  const upload = uploadStore((state) => state.uploads[file.name + file.size]);

  console.log(upload);

  const currentProgress = upload
    ? upload.parts.reduce((a, b) => a + b.progress, 0) / upload.parts.length
    : 0;

  return (
    <TableRow key={file.name}>
      <TableCell className="font-medium">{file.name}</TableCell>
      <TableCell>{formatFileSize(file.size)}</TableCell>
      <TableCell>{file.type}</TableCell>
      <TableCell>
        {file.lastModified
          ? format(file.lastModified, "MMMM dd',' yyyy")
          : "N/F"}
      </TableCell>
      <TableCell>
        {upload ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                {currentProgress ? `${currentProgress.toFixed(2)}%` : "N/A"}
              </span>
            </TooltipTrigger>
            <TooltipContent className="p-2 min-w-58" sideOffset={8}>
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto no-scrollbar">
                {upload.parts.length > 0 ? (
                  upload.parts.map((part) => (
                    <div
                      key={`${file.name}-part-${part.number}`}
                      className="w-full p-2 rounded-md bg-app-secondary flex flex-col"
                    >
                      <h6 className="text-xs text-app-primary-foreground">
                        Part {part.number}
                      </h6>
                      <div className="flex items-center gap-2 justify-end">
                        <Progress value={part.progress ? part.progress : 0} />
                        <p>{part.progress ? part.progress.toFixed(2) : 0}%</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No parts found.</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="w-full flex justify-end">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="iconSm">
                <EllipsisIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              // side='left'
              sideOffset={8}
              align="end"
              className="z-999 min-w-48"
            >
              <DropdownMenuItem>
                Copy name
                <CopyIcon />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRemoveFile(file)}>
                Remove
                <Trash2Icon />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
