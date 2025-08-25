import {
  Await,
  useLoaderData,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router";
import type { Route } from "../../internal/titles/+types/index";
import type { Genre } from "@/types/app";
import { Fragment } from "react/jsx-runtime";
import { Suspense, useEffect } from "react";
import { TitleDetails } from "@/components/titles/details";
import {
  TabAnimatedSpinner,
  TabLink,
  TabsLinkList,
} from "@/components/ui/tabs";
import { AnimatePresence } from "motion/react";
import { TitleDetailsSkeleton } from "@/components/skeletons/title-details";
import { getTitleContent } from "@/api/services/content.service";
import * as cookie from "cookie";

export async function loader({ params, request }: Route.LoaderArgs) {
  const cookies = request.headers.get("Cookie");
  if (!cookies) throw Error("cookies header not found, unauthorized");
  const token = cookie.parse(cookies)["token"];

  const title = getTitleContent(params.titleId, token);

  // const titleGenres: Promise<Genre[]> = client.v1.content
  //   .titles({ titleId: params.titleId })
  //   .genres.get()
  //   .then((r) => r.data);

  return { title };
}

export default function Page({ params }: Route.ComponentProps) {
  const { title } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function init() {
      const data = await title;

      if (location.pathname !== `/titles/${params.titleId}`) return;

      if (data.type === "MOVIE") {
        navigate(`/titles/${params.titleId}/related`);
      } else {
        navigate(`/titles/${params.titleId}/episodes`);
      }
    }

    init();
  }, [location]);

  return (
    <Fragment>
      <Suspense fallback={<TitleDetailsSkeleton goBack withDetails />}>
        <Await resolve={title}>
          {(data) => (
            <Fragment>
              <TitleDetails
                title={data}
                // genres={genres}
                currentProgress={null}
              />
              <div className="mt-1 max-w-screen-2xl mx-auto space-y-2 px-8">
                <TabsLinkList className="w-full">
                  {data.type === "TV_SHOW" && (
                    <TabLink to={`/titles/${params.titleId}/episodes`}>
                      {({ isPending }) => (
                        <Fragment>
                          Episodes
                          <AnimatePresence mode="wait">
                            {isPending && <TabAnimatedSpinner />}
                          </AnimatePresence>
                        </Fragment>
                      )}
                    </TabLink>
                  )}

                  <TabLink to={`/titles/${params.titleId}/related`}>
                    {({ isPending }) => (
                      <Fragment>
                        Related
                        <AnimatePresence mode="wait">
                          {isPending && <TabAnimatedSpinner />}
                        </AnimatePresence>
                      </Fragment>
                    )}
                  </TabLink>
                </TabsLinkList>
                <Outlet />
              </div>
            </Fragment>
          )}
        </Await>
      </Suspense>
    </Fragment>
  );
}

export function HydrateFallback() {
  return <p>Loading Game...</p>;
}
