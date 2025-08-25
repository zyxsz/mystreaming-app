import { ArrowRightIcon, PlusCircleIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ComboboxInput, type ComboboxItem } from "../ui/combobox";
import { FormProvider, useForm } from "react-hook-form";
import {
  getTitle,
  getTitleSeasons,
  searchTitles,
} from "@/api/services/titles.service";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect, useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SelectInput } from "../fields/select-input";
import { getTitleEpisodes } from "@/api/services/content.service";
import { format, parseISO } from "date-fns";
import { Spinner } from "../ui/spinner";
import type { Title } from "@/api/interfaces/title";
import type { Season } from "@/api/interfaces/season";
import type { Episode } from "@/api/interfaces/episode";
import { assignMedia } from "@/api/services/medias.service";
import { queryClient } from "@/app/root";
import { toast } from "sonner";

const schema = z.object({
  titleId: z.string(),
  seasonId: z.string().optional(),
  episodeId: z.string().optional(),
});

type Props = {
  mediaId: string;
};

export const AddMediaAssignModal = ({ mediaId }: Props) => {
  const form = useForm({ resolver: zodResolver(schema) });

  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState<Title | null>(null);
  const [seasons, setSeasons] = useState<Season[] | null>(null);
  const [episodes, setEpisodes] = useState<Episode[] | null>(null);

  const [isSeasonAndEpisodeSelected, setIsSeasonAndEpisodeSelected] =
    useState(false);

  const [isSubmitPending, startSubmitTransition] = useTransition();

  useEffect(() => {
    const subscription = form.watch(async (data, info) => {
      if (info.name === "titleId") {
        if (!data.titleId) {
          setTitle(null);
          setSeasons(null);
          setEpisodes(null);

          return;
        }

        const title = await getTitle(data.titleId);
        setTitle(title);

        if (title.type === "TV_SHOW") {
          const seasons = await getTitleSeasons(title.id, {
            page: 1,
            perPage: 999,
          });
          setSeasons(seasons.data);
        }
      }

      if (info.name === "seasonId") {
        form.resetField("episodeId");
        setIsSeasonAndEpisodeSelected(false);

        if (!data.titleId) return;
        if (!data.seasonId) {
          setEpisodes(null);
          return;
        }

        const episodes = await getTitleEpisodes(data.titleId, data.seasonId);
        setEpisodes(episodes);
      } else {
        if (data.seasonId && data.episodeId && data.titleId) {
          setIsSeasonAndEpisodeSelected(true);
        } else {
          setIsSeasonAndEpisodeSelected(false);
        }
      }
    });

    return subscription.unsubscribe;
  }, [form.watch]);

  useEffect(() => {
    if (!isOpen) return;

    form.reset();

    setTitle(null);
    setSeasons(null);
    setEpisodes(null);
  }, [isOpen]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    startSubmitTransition(async () => {
      await assignMedia(mediaId, {
        titleId: data.titleId,
        episodeId: data.episodeId,
      })
        .then((data) => {
          toast.success("Yeeeep", {
            description: "Media assigned successfully.",
          });
        })
        .catch((error) => {
          const message =
            error?.response?.data?.message ||
            "An error occurred while trying to assign this media";

          toast.error("Opps", {
            description: message,
          });
        })
        .finally(async () => {
          await queryClient.refetchQueries({
            queryKey: ["medias", mediaId, "assigns"],
            exact: false,
            stale: true,
          });
        });

      setIsOpen(false);
    });
  };

  const handleSearchTitle = async (query: string) => {
    const results = await searchTitles({ query });

    return results.map(
      (result) =>
        ({
          value: result.id,
          label: (
            <div className="flex items-center justify-between gap-4">
              <div className="text-start overflow-hidden text-ellipsis">
                <h6 className="text-sm text-app-primary-foreground">
                  {result.name}
                </h6>
                <p
                  className="text-xs line-clamp-2 text-app-primary-foreground-muted"
                  title={result.overview || undefined}
                >
                  {result.overview}
                </p>
              </div>
              {result.extras?.bannerUrl && (
                <figure className="w-24 shrink-0">
                  <img
                    src={result.extras.bannerUrl}
                    alt="Poster"
                    className="rounded-md shrink-0"
                  />
                </figure>
              )}
            </div>
          ),
        }) satisfies ComboboxItem
    );
  };

  const isValid = title
    ? title.type === "MOVIE"
      ? true
      : isSeasonAndEpisodeSelected
    : false;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          Add assign <PlusCircleIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle>Media assigns</DialogTitle>
          <DialogDescription>
            Fill the fields below to assign this media to a valid content, you
            can use smart search to fill all the secondary fields.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <FormProvider {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();

                form.handleSubmit(onSubmit)(e);
              }}
              className="flex flex-col gap-4"
            >
              <ComboboxInput
                name="titleId"
                label="Title"
                placeholder="Search for a title..."
                onSearch={handleSearchTitle}
              />

              {seasons && (
                <SelectInput
                  name="seasonId"
                  items={seasons.map((season) => ({
                    value: season.id,
                    label: season.name,
                  }))}
                  placeholder="Select a season..."
                  label="Season"
                />
              )}

              {episodes && (
                <SelectInput
                  key={episodes[0].id}
                  name="episodeId"
                  items={episodes.map((episode) => ({
                    value: episode.id,
                    label: (
                      <Fragment>
                        <span className="w-4">
                          {episode.number?.toString().padStart(2, "0")}
                        </span>
                        <span className="ml-2">{episode.name}</span>
                        {episode.airDate && (
                          <span className="ml-2 text-xs">
                            {format(
                              parseISO(episode.airDate),
                              "MMMM dd',' yyyy"
                            )}
                          </span>
                        )}
                      </Fragment>
                    ),
                  }))}
                  placeholder="Select a episode..."
                  label="Episode"
                />
              )}

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="link" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitPending || !isValid}
                >
                  {isSubmitPending ? (
                    <Fragment>
                      Assigning media <Spinner className="size-4" />
                    </Fragment>
                  ) : (
                    <Fragment>
                      Assign media <ArrowRightIcon />
                    </Fragment>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
};
