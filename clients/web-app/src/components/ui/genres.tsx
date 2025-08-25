import { Tag } from "./tag";
import { motion as m, type Variants } from "motion/react";
import type { ComponentProps } from "react";

type Props = {
  titleId: string;
  animationVariants?: Variants;
  tagProps?: Partial<ComponentProps<typeof Tag>>;
};

export const TitleGenres = ({
  titleId,
  animationVariants,
  tagProps,
}: Props) => {
  return null;

  // const { data, isLoading } = useQuery({
  //   queryKey: ["content", "titles", titleId, "genres"],
  //   queryFn: () => StreamingApi.content.titles.getGenres(titleId),
  // });

  // if (!data || isLoading) return null;

  // if (animationVariants)
  //   return data.map((genre) => (
  //     <m.span key={`${genre.id}-${titleId}`} variants={animationVariants}>
  //       <Tag key={genre.id + titleId} isLink {...tagProps}>
  //         {genre.name}
  //       </Tag>
  //     </m.span>
  //   ));

  // return data.map((genre) => (
  //   <Tag key={genre.id + titleId} isLink {...tagProps}>
  //     {genre.name}
  //   </Tag>
  // ));
};
