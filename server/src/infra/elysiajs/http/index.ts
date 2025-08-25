import Elysia from "elysia";

// import { swagger } from "@elysiajs/swagger";
import { BadRequestError } from "@/app/errors/bad-request";
import { NotFoundError } from "@/app/errors/not-found";
import { UnauthorizedError } from "@/app/errors/unauthorized";
import { InternalServerError } from "@/app/errors/internal-server";
import { UploadsEndpoints } from "./endpoints/uploads.endpoints";
import { AuthEndpoints } from "./endpoints/auth.endpoints";
import { MediasEndpoints } from "./endpoints/medias.endpoints";
import { PlaybacksEndpoints } from "./endpoints/playbacks.endpoints";
import { EncodesEndpoints } from "./endpoints/encodes.endpoints";
import { MetricsEndpoints } from "./endpoints/metrics.endpoints";
import { ContentEndpoints } from "./endpoints/content.endpoints";
import { CallbackEndpoints } from "./endpoints/callback.endpoints";
import { TitlesEndpoints } from "./endpoints/titles.endpoints";
import { endpoints } from "./endpoints/a.endpoints";

export const v1App = new Elysia({ prefix: "v1" })
  .error({
    BadRequestError,
    NotFoundError,
    UnauthorizedError,
    InternalServerError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "BadRequestError":
        set.status = 400;

        return { message: error.message, status: 400 };
      case "NotFoundError":
        set.status = 404;

        return { message: error.message, status: 404 };
      case "UnauthorizedError":
        set.status = 401;

        return { message: error.message, status: 401 };

      case "InternalServerError":
        set.status = 500;

        return { message: error.message, status: 500 };
    }
  })
  .use(endpoints)
  .use(UploadsEndpoints)
  .use(AuthEndpoints)
  .use(MediasEndpoints)
  .use(PlaybacksEndpoints)
  .use(EncodesEndpoints)
  .use(TitlesEndpoints)
  .use(MetricsEndpoints)
  .use(ContentEndpoints)
  .use(CallbackEndpoints);
