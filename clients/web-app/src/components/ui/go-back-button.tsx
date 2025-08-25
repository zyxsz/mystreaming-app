import { NavLink } from "react-router";
import { Button } from "./button";
import { ArrowLeftIcon } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { Spinner } from "./spinner";

type Props = {
  href: string;
};

export const GoBackButton = ({ href }: Props) => {
  return (
    <Button variant="link" size="link" asChild>
      <NavLink to={href} end>
        {({ isPending }) => (
          <Fragment>
            {isPending ? <Spinner className="size-4" /> : <ArrowLeftIcon />}
            Go back
          </Fragment>
        )}
      </NavLink>
    </Button>
  );
};
