import { FileInput } from "@/components/fields/file-input";
import type { Route } from "./+types/add-content.page";
import { useForm } from "react-hook-form";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  EllipsisIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { z } from "zod";
import { Fragment, useEffect, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { uploadStore } from "@/stores/upload";
import { formatFileSize } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  getTitleSeasons,
  parseTitleFileNames,
} from "@/api/services/titles.service";
import { useQuery } from "@tanstack/react-query";
import type { Season } from "@/api/interfaces/season";
import { getTitleEpisodes } from "@/api/services/content.service";
import { Spinner } from "@/components/ui/spinner";
import { mapLimit } from "async";
import { assignMedia, createMedia } from "@/api/services/medias.service";

const schema = z.object({
  files: z.array(
    z
      .instanceof(File, { message: "Video is required" })
      .refine((file) => !file || file.size !== 0 || file.size <= 3000000000, {
        message: "Max size exceeded",
      })
  ),
});

interface FilePreview {
  parsedData?: {
    from: string;
    title: string;
    season?: {
      id?: string;
      number?: number;
    };
    episode?: {
      id?: string;
      number?: number;
    };
    type: "MOVIE" | "EPISODE";
  };
  file: File;
}

export default function Page({ params: { titleId } }: Route.ComponentProps) {
  const [filesPreview, setFilesPreview] = useState<FilePreview[]>([]);
  const [isUploadingPending, startUploadTransition] = useTransition();

  const form = useForm({ resolver: zodResolver(schema) });

  const { data: seasons } = useQuery({
    queryKey: ["titles", titleId, "seasons"],
    queryFn: () => getTitleSeasons(titleId, { page: 1, perPage: 999 }),
  });

  useEffect(() => {
    const subscription = form.watch(async (data, info) => {
      if (info.name !== "files") return;
      if (!data.files) return;

      if (data.files.length <= 0) {
        setFilesPreview([]);

        return;
      }

      const parsedData = await parseTitleFileNames(titleId, {
        fileNames: (data.files as File[]).map((f) => f.name),
      });

      setFilesPreview(
        data.files
          .filter((f) => !!f)
          .map((file) => {
            const parsed = parsedData.find((p) => p.from === file.name);

            return {
              parsedData: parsed,
              file: file!,
            } satisfies FilePreview;
          })
      );
    });

    return subscription.unsubscribe;
  }, []);

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(data, filesPreview);

    startUploadTransition(async () => {
      const responses = await uploadStore.getState().uploadFiles(data.files);

      const medias = await mapLimit(
        responses,
        1,
        async (uploadResponse: (typeof responses)[0]) => {
          const media = await createMedia({
            name: `[ACU] ${uploadResponse.file.name}`,
            uploadId: uploadResponse.uploadId,
            autoEncode: true,
          });

          return { media, file: uploadResponse.file };
        }
      );

      await mapLimit(medias, 1, async (mediaResponse: (typeof medias)[0]) => {
        const preview = filesPreview.find((p) => p.file === mediaResponse.file);

        console.log(preview);

        const seasonId = preview?.parsedData?.season?.id;
        const episodeId = preview?.parsedData?.episode?.id;

        if (!episodeId) return;

        assignMedia(mediaResponse.media.id, { titleId, episodeId: episodeId });
      });
    });
  };

  const handleRemoveFile = (preview: FilePreview) => {
    form.setValue(
      "files",
      form.getValues("files")?.filter((f) => f.name !== preview.file.name)
    );
  };

  const handleChangeSeason = (preview: FilePreview, seasonId: string) => {
    setFilesPreview((state) =>
      state.map((p) => {
        if (p.file.name === preview.file.name) {
          return {
            ...p,
            parsedData: p.parsedData
              ? {
                  ...p.parsedData,
                  season: { id: seasonId },
                }
              : undefined,
            // parsedData: {
            //   ...p.parsedData,
            //   season: { id: seasonId },
            // },
          };
        }

        return p;
      })
    );
  };

  const handleChangeEpisode = (preview: FilePreview, episodeId: string) => {
    setFilesPreview((state) =>
      state.map((p) => {
        if (p.file.name === preview.file.name) {
          return {
            ...p,
            parsedData: p.parsedData
              ? {
                  ...p.parsedData,
                  episode: { id: episodeId },
                }
              : undefined,
          };
        }

        return p;
      })
    );
  };
  return (
    <div className="space-y-2">
      <header className="flex items-center gap-2">
        <h1 className="ml-2 text-base font-bold text-app-primary-foreground">
          Add content
        </h1>

        <p className="ml-2 text-sm text-app-primary-foreground-muted">
          Select files in the input below
        </p>
      </header>

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          form.handleSubmit(onSubmit)(e);
        }}
      >
        <FileInput
          id="files"
          className="hidden"
          control={form.control}
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
            Only videos accepted, max file size: 20GB
          </p>
        </label>

        {filesPreview.length > 0 && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Episode</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last modified</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filesPreview.map((preview) => (
                  <FileRow
                    key={preview.file.name}
                    titleId={titleId}
                    preview={preview}
                    handleRemoveFile={handleRemoveFile}
                    seasons={seasons?.data}
                    handleChangeSeason={handleChangeSeason}
                    handleChangeEpisode={handleChangeEpisode}
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
            // onClick={handleCancel}
            // disabled={isUploadingPending}
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
  titleId,
  preview,
  handleRemoveFile,
  seasons,
  handleChangeSeason,
  handleChangeEpisode,
}: {
  titleId: string;
  preview: FilePreview;
  handleRemoveFile: (file: FilePreview) => void;
  seasons: Season[] | undefined;
  handleChangeSeason: (preview: FilePreview, seasonId: string) => void;
  handleChangeEpisode: (preview: FilePreview, episodeId: string) => void;
}) => {
  const upload = uploadStore(
    (state) => state.uploads[preview.file.name + preview.file.size]
  );

  const currentProgress = upload
    ? upload.parts.reduce((a, b) => a + b.progress, 0) / upload.parts.length
    : 0;

  const currentSeason = seasons?.find(
    (s) => s.id === preview.parsedData?.season?.id
  );

  const { data: episodes } = useQuery({
    queryKey: ["seasons", currentSeason?.id || null, "episodes"],
    queryFn: () => {
      if (!currentSeason?.id) return [];

      return getTitleEpisodes(titleId, currentSeason.id);
    },
  });

  const currentEpisode = episodes?.find(
    (e) => e.id === preview.parsedData?.episode?.id
  );

  return (
    <TableRow key={preview.file.name}>
      <TableCell className="font-medium max-w-80 overflow-ellipsis overflow-hidden">
        {preview.file.name}
      </TableCell>
      <TableCell>{formatFileSize(preview.file.size)}</TableCell>
      <TableCell>
        {seasons ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="link" className="pl-0">
                {currentSeason ? currentSeason.name : "Select a season"}
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" sideOffset={8}>
              {seasons.map((season) => (
                <DropdownMenuItem
                  key={season.id}
                  onClick={() => handleChangeSeason(preview, season.id)}
                >
                  {season.name}
                  {preview.parsedData?.season?.id === season.id && (
                    <CheckIcon />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell>
        {episodes ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="link" className="pl-0">
                {currentEpisode ? (
                  <span>
                    <span className="w-4">
                      {currentEpisode.number?.toString().padStart(2, "0")}
                    </span>
                    <span className="ml-1">{currentEpisode.name}</span>
                  </span>
                ) : (
                  "Select a episode"
                )}
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" sideOffset={8}>
              {episodes.map((episode) => (
                <DropdownMenuItem
                  key={episode.id}
                  onClick={() => handleChangeEpisode(preview, episode.id)}
                >
                  <span>
                    <span className="w-4">
                      {episode.number?.toString().padStart(2, "0")}
                    </span>
                    <span className="ml-2">{episode.name}</span>
                    {episode.airDate && (
                      <span className="ml-2 text-xs">
                        {format(parseISO(episode.airDate), "MMMM dd',' yyyy")}
                      </span>
                    )}
                  </span>

                  {preview.parsedData?.episode?.id === episode.id && (
                    <CheckIcon />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell>{preview.file.type}</TableCell>
      <TableCell>
        {preview.file.lastModified
          ? format(preview.file.lastModified, "MMMM dd',' yyyy")
          : "N/F"}
      </TableCell>
      <TableCell>
        {upload ? (
          // <Tooltip>
          //   <TooltipTrigger asChild>
          <span>
            {currentProgress ? `${currentProgress.toFixed(2)}%` : "N/A"}
          </span>
        ) : (
          /* </TooltipTrigger>
            <TooltipContent className="p-2 min-w-58" sideOffset={8}>
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto no-scrollbar">
                {upload.parts.length > 0 ? (
                  upload.parts.map((part) => (
                    <div
                      key={`${preview.file.name}-part-${part.number}`}
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
          </Tooltip> */
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
              <DropdownMenuItem onClick={() => handleRemoveFile(preview)}>
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
