import Elysia, { t } from 'elysia';
import { authMiddleware } from 'mys-server/src/infra/elysiajs/http/middlewares/auth';
import { ProgressService } from '@/infra/v1/app/services/progress-service';
import { getUserPermissions } from '@/infra/v1/app/auth';
import { UnauthorizedError } from '@/app/errors/unauthorized';

export const progressRoutes = new Elysia({ prefix: '/progress' })
  .use(authMiddleware)
  .put(
    '/save',
    async ({ body, user }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('save', 'Progress')) throw new UnauthorizedError();

      await ProgressService.save({
        completed: body.completed,
        currentTime: body.currentTime,
        percentage: body.percentage,
        titleId: body.titleId,
        totalDuration: body.totalDuration,
        userId: user.id,
        episodeId: body.episodeId,
      });

      return { success: true };
    },
    {
      body: t.Object({
        titleId: t.String(),
        episodeId: t.Optional(t.String()),
        currentTime: t.Numeric(),
        totalDuration: t.Numeric(),
        percentage: t.Numeric(),
        completed: t.Boolean(),
      }),
    },
  );
