import { env } from "@/config/env";
import axios from "axios";
import { generatePutPresignedUrl, uploadArrayBuffer } from "./storage";
import { tmdbService } from "./tmdb";
import { generateUUID } from "@/infra/lib/uuid";
import { database } from "@/infra/database";
import { titleImagesTable } from "@/infra/database/schemas/title-images";
import Queue from "queue";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { signJWTToken, verifyJWTToken } from "@/infra/lib/jwt";
import { and, eq } from "drizzle-orm";

const inQueue: string[] = [];
const queue = new Queue({ concurrency: 2, autostart: true });

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sqsClient = new SQSClient({
  // endpoint: env.IMAGE_PROCESSOR_SQS_ENDPOINT,
  // credentials: {
  //   accessKeyId: env.IMAGE_PROCESSOR_SQS_ACCESS_KEY_ID,
  //   secretAccessKey: env.IMAGE_PROCESSOR_SQS_SECRET_ACCESS_KEY,
  // },
  region: env.IMAGE_PROCESSOR_SQS_REGION,
});

type ImageMessageBody = {
  titleId: string;
  imageId: string;
  type: "BANNER" | "POSTER";
  width: number;
  height: number;
};

export const verifyImageProcessorToken = async (token: string) => {
  const data = verifyJWTToken<ImageMessageBody>(token);

  return data;
};

export const generateTitleBanner = async ({
  bannerSize,
  title,
  type,
}: {
  title: {
    id: string;
    tmdbId: number;
    type: "MOVIE" | "TV_SHOW";
    bannerKey: string;
  };
  bannerSize: number;
  type: "BANNER" | "POSTER";
}) => {
  const width = bannerSize || 512;
  const height = width / (type === "BANNER" ? 16 / 9 : 2 / 3);

  const alreadyExistsImage = await database
    .select({ id: titleImagesTable.id })
    .from(titleImagesTable)
    .where(
      and(
        eq(titleImagesTable.titleId, title.id),
        eq(titleImagesTable.width, width),
        eq(titleImagesTable.height, height),
        eq(titleImagesTable.type, type),
        eq(titleImagesTable.isProcessed, false)
      )
    )
    .limit(1);

  if (alreadyExistsImage.length > 0)
    return console.log("Title image already in queue");

  console.log("[IMAGES] Generating banner for ", title.tmdbId);

  const images =
    title.type === "MOVIE"
      ? await tmdbService.movie.fetchImages(title.tmdbId).catch(() => null)
      : await tmdbService.tv.fetchImages(title.tmdbId).catch(() => null);

  if (!images) {
    console.log("Images not found", title.id, title.tmdbId);

    return null;
  }

  const poster = images?.posters.find((p) => p.iso_639_1 === null);

  if (type === "POSTER" && !poster) {
    console.log("Poster not found");

    return null;
  }

  const logo = images?.logos[0];

  const key = `${
    type === "BANNER" ? "banners" : "posters"
  }/${width}/${generateUUID()}.png`;

  const titleImage = await database
    .insert(titleImagesTable)
    .values({
      key: key,
      width: width,
      height: height,
      type: type,
      titleId: title.id,
      isProcessed: false,
    })
    .returning({
      id: titleImagesTable.id,
      key: titleImagesTable.key,
    })
    .then((result) => result[0] || null);

  if (!titleImage) return null;

  const imageToken = await signJWTToken({
    titleId: title.id,
    imageId: titleImage.id,
    type,
    width,
    height,
  } satisfies ImageMessageBody);

  const uploadUrl = await generatePutPresignedUrl(key, {
    type: "image/png",
    acl: "public-read",
  });

  const imageData = {
    uploadUrl,
    bannerUrl:
      type === "BANNER"
        ? await axios
            .get(
              tmdbService.assets.getFullUrl(
                title.bannerKey,
                width === 512 ? "w500" : undefined
              ),
              { responseType: "arraybuffer" }
            )
            .then(
              (res) =>
                `data:image/png;base64,${Buffer.from(res.data).toString(
                  "base64"
                )}`
            )
        : undefined,
    posterUrl:
      type === "POSTER"
        ? tmdbService.assets.getFullUrl(
            poster!.file_path,
            width === 512 ? "w500" : undefined
          )
        : undefined,
    logoUrl: logo?.file_path
      ? tmdbService.assets.getFullUrl(
          logo.file_path,
          width === 512 ? "w300" : undefined
        )
      : undefined,

    width: width,
    height: height,

    type,
    token: imageToken,
    callbackUrl: `${env.HOST_URL}/v1/callback/image-processor`,
  };

  console.log(env.HOST_URL);

  if (env.AWS_LAMBDA_FUNCTION_NAME) {
    await sqsClient.send(
      new SendMessageCommand({
        MessageBody: JSON.stringify(imageData),
        QueueUrl: env.IMAGE_PROCESSOR_SQS_QUEUE,
      })
    );
  }
};

export const generateBanner = async (data: {
  width: number;
  bannerUrl: string;
  logoUrl?: string;
  path: string;
}) => {
  //   console.log("Generating bannner ", data.path);
  //   const bannerData = await axios
  //     .get(data.bannerUrl, { responseType: "arraybuffer" })
  //     .then((response) => {
  //       return (
  //         `data:${response.headers["content-type"]};base64,` +
  //         Buffer.from(response.data).toString("base64")
  //       );
  //     });
  //   const logoData = data.logoUrl
  //     ? await axios
  //         .get(data.logoUrl, { responseType: "arraybuffer" })
  //         .then((response) => {
  //           return (
  //             `data:${response.headers["content-type"]};base64,` +
  //             Buffer.from(response.data).toString("base64")
  //           );
  //         })
  //     : null;
  //   const width = data.width || 512;
  //   const height = width / (16 / 9);
  //   const logoWidthSize = 0.4 * width;
  //   const logoHeightSize = 0.3 * height;
  //   const html = `<html>
  //   <head>
  //     <style>
  //       * {
  //         margin: 0;
  //         padding: 0;
  //         border: 0;
  //       }
  //       body {
  //         width: ${width}px;
  //         height: ${height}px;
  //       }
  //       .bannerContainer {
  //         position: relative;
  //         width: 100%;
  //         height: 100%;
  //         background: #000;
  //       }
  //       .bannerImage{
  //         width: 100%;
  //         height: auto;
  //         position: absolute;
  //         top: 0;
  //         left: 0;
  //         right: 0;
  //         bottom: 0;
  //         z-index: 10;
  //       }
  //       .background {
  //         width: 100%;
  //         height: 100%;
  //         position: absolute;
  //         top: 0;
  //         left: 0;
  //         right: 0;
  //         bottom: 0;
  //         z-index: 11;
  //         /* background-color: rgba(0,0,0,0.35); */
  //         background: rgb(0,0,0);
  //         background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22452731092436973) 43%, rgba(0,0,0,0.7231267507002801) 80%, rgba(0,0,0,0.8127626050420168) 100%)
  //       }
  //       .logoImage{
  //         position: absolute;
  //         bottom: 24px;
  //         left: 24px;
  //         width: 100%;
  //         max-width: ${logoWidthSize}px;
  //         height: auto;
  //         max-height: ${logoHeightSize}px;
  //         object-fit: contain;
  //         object-position: left;
  //         z-index: 99;
  //       }
  //     </style>
  //   </head>
  //   <body>
  //     <figure class="bannerContainer">
  //       <img class="bannerImage" src="${bannerData}" alt="Banner data"/>
  //       ${
  //         logoData
  //           ? `<img class="logoImage" src="${logoData}" alt="Logo data"/>`
  //           : ""
  //       }
  //       <div class="background"/>
  //     </figure>
  //   </body>
  // </html>`;
  //   const image = await generateImage(html, { width, height });
  //   return { key: await uploadArrayBuffer(image, data.path), width, height };
};

export const generateImage = async (
  html: string,
  viewport?: { width: number; height: number }
) => {
  // const response = await axios
  //   .post(
  //     `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_BROWSER_RENDERING_ACCOUNT_ID}/browser-rendering/screenshot`,
  //     { html, viewport },
  //     {
  //       responseType: "arraybuffer",
  //       headers: {
  //         Authorization: `Bearer ${env.CLOUDFLARE_BROWSER_RENDERING_ACCESS_TOKEN}`,
  //       },
  //     }
  //   )
  //   .then((response) => response.data)
  //   .catch((e) => {
  //     console.log("AAAAAAAA", e.error.message);
  //     return null;
  //   });
  // if (!response) throw new Error("Unable to create image");
  // return response;
};
