import type { Title } from "@/app/entities/title.entity";
import type { TitlesRepository } from "@/app/repositories/titles.repository";
import type { Pagination } from "@/core/types/pagination";
import type {
  FindManyMediaAssignsByIdWithPaginationDTO,
  FindManySeasonsByTitleIdWithPaginationDTO,
  FindWithPaginationDTO,
  ParseFileNamesDTO,
} from "./titles.dto";
import { NotFoundError } from "@/app/errors/not-found";
import type { MediaAssignsRepository } from "@/app/repositories/media-assigns-repository";
import type { MediaAssign } from "@/app/entities/media-assign";
import type { SeasonsRepository } from "@/app/repositories/seasons.repository";
import type { Season } from "@/app/entities/season.entity";
import {
  filenameParse,
  ParsedShow,
  ParsedMovie,
} from "@ctrl/video-filename-parser";
import parser from "video-name-parser";
import { mapLimit } from "async";
import type { EpisodesRepository } from "@/app/repositories/episodes.repository";

export class TitlesUseCase {
  constructor(
    private titlesRepository: TitlesRepository,
    private mediaAssignsRepository: MediaAssignsRepository,
    private seasonsRepository: SeasonsRepository,
    private episodesRepository: EpisodesRepository
  ) {}

  async findManyWithPagination(
    dto: FindWithPaginationDTO
  ): Promise<Pagination<Title>> {
    const result = await this.titlesRepository.findManyWithPagination(
      dto.page,
      dto.perPage,
      dto.search
    );

    return {
      data: result.data,
      pagination: {
        size: dto.perPage,
        totalPages: result.total,
      },
    };
  }

  async findById(id: string): Promise<Title> {
    const title = await this.titlesRepository.findById(id);

    if (!title) throw new NotFoundError("Title not found");

    return title;
  }

  async findManyMediaAssignsByTitleId(
    dto: FindManyMediaAssignsByIdWithPaginationDTO
  ): Promise<Pagination<MediaAssign>> {
    const results =
      await this.mediaAssignsRepository.findManyByTitleIdWithPagination(
        dto.titleId,
        dto.page,
        dto.perPage
      );

    return {
      data: results.data,
      pagination: {
        size: dto.perPage,
        totalPages: results.total,
      },
    };
  }

  async findManySeasonsByTitleIdWithPagination(
    dto: FindManySeasonsByTitleIdWithPaginationDTO
  ): Promise<Pagination<Season>> {
    const result = await this.seasonsRepository.findManyByTitleIdWithPagination(
      dto.titleId,
      dto.page,
      dto.perPage
    );

    return {
      data: result.data,
      pagination: {
        totalPages: result.total,
        size: dto.perPage,
      },
    };
  }

  async search(query: string): Promise<Title[]> {
    const results = await this.titlesRepository.searchMany(query);

    return results;
  }

  async parseFileNames(id: string, dto: ParseFileNamesDTO) {
    const title = await this.titlesRepository.findById(id);

    if (!title) throw new NotFoundError("Title not found");

    return await mapLimit(dto.fileNames, 1, async (fileName: string) => {
      const parsed = filenameParse(
        fileName,
        title.type === "TV_SHOW" ? true : false
      );

      console.log(parsed);

      if (title.type === "TV_SHOW") {
        const seasonNumber = (parsed as ParsedShow).seasons[0];
        const episodeNumber = (parsed as ParsedShow).episodeNumbers[0];

        const season = seasonNumber
          ? await this.seasonsRepository.findFirstByNumberAndTitleId(
              title.id.toString(),
              seasonNumber
            )
          : null;

        const episode = season
          ? await this.episodesRepository.findFirstBySeasonIdAndNumber(
              season.id.toString(),
              episodeNumber
            )
          : null;

        return {
          from: fileName,
          title: parsed.title,
          season: {
            id: season?.id.toString(),
            number: seasonNumber,
          },
          episode: {
            id: episode?.id.toString(),
            number: episodeNumber,
          },
          type: "EPISODE",
          // original: parsed,
        };
      } else {
        return {
          from: fileName,
          // parsed,
          type: "MOVIE",
        };
      }
    });
  }
}
