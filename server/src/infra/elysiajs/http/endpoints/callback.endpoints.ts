import Elysia, { t } from "elysia";
import { JWTService } from "../../services/jwt.service";
import { database } from "../../database";
import { titleImagesTable } from "../../database/schemas/title-images";
import { eq } from "drizzle-orm";
import { NotFoundError } from "@/app/errors/not-found";

const jwtService = new JWTService();

export const CallbackEndpoints = new Elysia({ prefix: "/callback" }).post(
  "/image-processor",
  async ({ body }) => {
    const data = await jwtService.decryptWebToken<{ imageId: string }>(
      body.token
    );

    console.log("Image process callback", body, data);

    const titleImage = await database
      .select({ id: titleImagesTable.id, key: titleImagesTable.key })
      .from(titleImagesTable)
      .where(eq(titleImagesTable.id, data.imageId))
      .limit(1)
      .then((result) => result[0]);

    if (!titleImage) throw new NotFoundError("Title image not found");

    await database
      .update(titleImagesTable)
      .set({ isProcessed: true })
      .where(eq(titleImagesTable.id, data.imageId));
  },
  {
    body: t.Object({
      token: t.String(),
    }),
  }
);
