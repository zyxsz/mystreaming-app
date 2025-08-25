import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/test", "./routes/test.tsx"),

  layout("./layouts/internal.layout.tsx", [
    layout("./layouts/home.layout.tsx", [
      index("routes/internal/home.tsx"),

      ...prefix("titles", [
        route(":titleId", "./routes/internal/titles/index.tsx", [
          route("episodes", "./routes/internal/titles/episodes.tsx"),
          route("related", "./routes/internal/titles/related.tsx"),
        ]),
      ]),
    ]),
    route("watch/:titleId", "./routes/internal/watch/index.tsx"),
    layout("./layouts/dashboard.layout.tsx", [
      ...prefix("/media-center", [
        route("/dashboard", "./routes/internal/media-center/index.tsx"),
        ...prefix("/medias", [
          index("./routes/internal/media-center/medias/index.tsx"),
          route("/new", "./routes/internal/media-center/medias/new.tsx"),
          route(
            "/:mediaId",
            "./routes/internal/media-center/medias/details/index.tsx",
            [
              index(
                "./routes/internal/media-center/medias/details/playbacks.tsx"
              ),
              route(
                "assigns",
                "./routes/internal/media-center/medias/details/assigns.tsx"
              ),
              route(
                "watch",
                "./routes/internal/media-center/medias/details/watch.tsx"
              ),
              route(
                "edit",
                "./routes/internal/media-center/medias/details/edit.tsx"
              ),
            ]
          ),
        ]),
        ...prefix("/uploads", [
          index("./routes/internal/media-center/uploads/index.tsx"),
          route("/new", "./routes/internal/media-center/uploads/new.tsx"),
        ]),
        ...prefix("/encodes", [
          index("./routes/internal/media-center/encodes/index.tsx"),
        ]),
      ]),
      ...prefix("/content-center", [
        // route("/dashboard", "./routes/internal/media-center/index.tsx"),
        ...prefix("/titles", [
          index("./routes/internal/content-center/titles/index.tsx"),
          route(
            "/:titleId",
            "./routes/internal/content-center/titles/details/index.tsx",
            [
              index(
                "./routes/internal/content-center/titles/details/content.tsx"
              ),
              route(
                "content/add",
                "./routes/internal/content-center/titles/details/add-content.page.tsx"
              ),
              route(
                "seasons",
                "./routes/internal/content-center/titles/details/seasons.tsx"
              ),
            ]
          ),
        ]),
      ]),
    ]),
  ]),
  layout(
    "./layouts/public.layout.tsx",
    prefix("auth", [route("login", "routes/public/auth/login/route.tsx")])
  ),
] satisfies RouteConfig;
