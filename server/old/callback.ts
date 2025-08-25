import Elysia, { t } from 'elysia';
import { verifyImageProcessorToken } from 'mys-server/src/infra/elysiajs/http/services/images';
import { database } from '@/infra/database';
import { BadRequestError } from '../../app/errors/bad-request';
import { titlesTable } from '@/infra/database/schemas/titles';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '../../app/errors/not-found';
import { generateUUID } from '@/infra/lib/uuid';
import { titleImagesTable } from '@/infra/database/schemas/title-images';
import { uploadFile } from 'mys-server/src/infra/elysiajs/http/services/storage';

export const callbackRoutes = new Elysia({ prefix: 'callback' }).post(
  '/image-processor',
  async ({ body }) => {
    console.log('Callback recived', body);

    const data = await verifyImageProcessorToken(body.token);

    if (!data) throw new BadRequestError('Invalid token');

    if (!data?.titleId)
      throw new BadRequestError('Invalid titleId found in token');

    const titleImage = await database
      .select({ id: titleImagesTable.id, key: titleImagesTable.key })
      .from(titleImagesTable)
      .where(eq(titleImagesTable.id, data.imageId))
      .limit(1)
      .then((result) => result[0]);

    if (!titleImage) throw new NotFoundError('Title image not found');

    await database
      .update(titleImagesTable)
      .set({ isProcessed: true })
      .where(eq(titleImagesTable.id, data.imageId));
  },
  {
    body: t.Object({
      token: t.String(),
    }),
  },
);
