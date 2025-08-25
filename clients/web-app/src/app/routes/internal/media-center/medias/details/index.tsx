import { apiClient } from "@/services/api";
import type { Route } from "./+types/index";
import type { MediaGet } from "@/types/app";
import { GoBackButton } from "@/components/ui/go-back-button";
import { MediaDetails } from "../components/media-details";
import { MediaPlaybacks } from "../components/media-playbacks";
import { LoadingContainer } from "@/components/ui/loading-container";
import {
  TabAnimatedSpinner,
  TabLink,
  TabsLinkList,
} from "@/components/ui/tabs";
import { Outlet } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { AnimatePresence } from "motion/react";
import { ArrowLeftIcon } from "lucide-react";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { mediaId } = params;

  const media = await apiClient()
    .v1.medias({ mediaId })
    .get()
    .then((r) => r.data as MediaGet);

  return { media };
}

export function HydrateFallback() {
  return (
    <div className="flex flex-col gap-6 max-w-screen-xl">
      <GoBackButton href="/media-center/medias" />
      <LoadingContainer />
    </div>
  );
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { media } = loaderData;

  return (
    <div className="flex flex-col gap-6">
      {/* <GoBackButton href="/media-center/medias" /> */}
      {/* <MediaDetails media={media} /> */}
      <div className="w-full space-y-6">
        <TabsLinkList className="w-full justify-start">
          <TabLink className="flex-0 px-2" to={`/media-center/medias`} end>
            {({ isPending }) => (
              <Fragment>
                <ArrowLeftIcon />
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
          <TabLink
            className="flex-0 px-4"
            to={`/media-center/medias/${media.id}`}
            end
          >
            {({ isPending }) => (
              <Fragment>
                Playbacks
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
          <TabLink
            className="flex-0 px-4"
            to={`/media-center/medias/${media.id}/assigns`}
          >
            {({ isPending }) => (
              <Fragment>
                Assigns
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
          <TabLink
            className="flex-0 px-4"
            to={`/media-center/medias/${media.id}/watch`}
          >
            {({ isPending }) => (
              <Fragment>
                Watch
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
          <TabLink
            className="flex-0 px-4"
            to={`/media-center/medias/${media.id}/edit`}
          >
            {({ isPending }) => (
              <Fragment>
                Edit
                <AnimatePresence mode="wait">
                  {isPending && <TabAnimatedSpinner />}
                </AnimatePresence>
              </Fragment>
            )}
          </TabLink>
        </TabsLinkList>
        <Outlet />
      </div>
      {/* <MediaPlaybacks media={media} /> */}
    </div>
  );
}
