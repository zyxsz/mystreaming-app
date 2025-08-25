import { StarIcon } from "lucide-react";

type RatingStarsProps = {
  count: number;
  value: number;
};

export const RatingStars = ({ count, value }: RatingStarsProps) => {
  const starsHighlight = Math.floor(value);

  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: count }, (_, i) => i + 1).map((v, i) => {
        if (i + 1 <= starsHighlight)
          return (
            <StarIcon
              key={i}
              className="w-6 h-6 fill-app-primary-foreground text-app-primary-foreground-"
            />
          );

        return (
          <StarIcon
            key={i}
            className="w-6 h-6 text-app-primary-foreground-muted"
          />
        );
      })}
    </div>
  );
};
