import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Tag } from "../ui/tag";
import { getTitleSeasons } from "@/api/services/content.service";
import type { Season } from "@/api/interfaces/season";

type Props = {
  titleId: string;
  currentSeasonId?: string;
};

export const SeasonsButton = ({ titleId, currentSeasonId }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const selectedSeasonId = searchParams.get("seasonId") || currentSeasonId;

  const { data } = useQuery<Season[]>({
    queryKey: ["titles", titleId, "seasons"],
    queryFn: () => getTitleSeasons(titleId),
  });

  if (!data)
    return (
      <Tag isLink>
        Seasons
        <ChevronDownIcon />
      </Tag>
    );

  const firstSeason = data[0];
  const selectedSeason = selectedSeasonId
    ? data.find((s) => s.id === selectedSeasonId) || firstSeason
    : firstSeason;

  const handleSelectSeason = (seasonId: string) => {
    const params = new URLSearchParams(searchParams);
    if (seasonId) {
      params.set("seasonId", seasonId);
    } else {
      params.delete("seasonId");
    }
    navigate(`${location.pathname}?${params.toString()}`);
  };

  return (
    <Fragment>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Tag isLink>
            {selectedSeason.name}
            <ChevronDownIcon />
          </Tag>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" sideOffset={8}>
          {data.map((season) => (
            <DropdownMenuItem
              key={season.id}
              onClick={() => handleSelectSeason(season.id)}
            >
              {season.name}
              {selectedSeason.id === season.id && <CheckIcon />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Fragment>
  );
};
