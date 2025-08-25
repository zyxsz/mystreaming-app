import type { Route } from ".react-router/types/src/app/+types/root";
import { Await, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { Fragment, Suspense } from "react";
import { FeaturedContainer } from "@/components/home/featured-titles";
import { FeaturedTitleSkeleton } from "@/components/skeletons/featured-title";
import * as cookie from "cookie";
import {
  getCollections,
  getFeaturedContent,
} from "@/api/services/content.service";
import { CollectionSkeleton } from "@/components/skeletons/collection";
import { ContentCollections } from "@/components/content/collections";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookies = request.headers.get("Cookie");

  if (!cookies) throw Error("cookies header not found, unauthorized");

  const token = cookie.parse(cookies)["token"];

  const featuredTitles = getFeaturedContent(token);
  const collections = getCollections(token);

  return { featuredTitles, collections };
}

export default function Home() {
  const { featuredTitles, collections } = useLoaderData<typeof loader>();

  return (
    <div className="pb-12">
      <Suspense fallback={<FeaturedTitleSkeleton />}>
        <Await resolve={featuredTitles}>
          {(data) => <FeaturedContainer titles={data} />}
        </Await>
      </Suspense>

      <Suspense
        fallback={
          <div className="relative -mt-32 flex flex-col gap-6 z-30">
            <CollectionSkeleton />
            <CollectionSkeleton />
            <CollectionSkeleton />
            <CollectionSkeleton />
            <CollectionSkeleton />
          </div>
        }
      >
        <Await resolve={collections}>
          {(data) => <ContentCollections collections={data} />}
        </Await>
      </Suspense>
    </div>
  );
}
