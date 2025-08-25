import {
  Clapperboard,
  ClapperboardIcon,
  DatabaseZapIcon,
  FolderUp,
  GaugeIcon,
  HomeIcon,
  ScrollTextIcon,
} from "lucide-react";
import { Logo } from "./logo";
import { Fragment, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router";
import { Spinner } from "./spinner";

const SidebarGroup = ({ className, ...rest }: ComponentProps<"div">) => {
  return <div className={cn("flex flex-col gap-1", className)} {...rest} />;
};

SidebarGroup.Title = ({ className, ...rest }: ComponentProps<"h1">) => {
  return (
    <h1
      className={cn(
        "text-sm font-bold uppercase text-app-secondary-foreground-muted select-none tracking-wide",
        className
      )}
      {...rest}
    />
  );
};

SidebarGroup.Link = ({
  className,

  ...rest
}: ComponentProps<typeof NavLink>) => {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 text-sm [&_svg]:transition-colors [&_svg,&_div]:size-5 [&_svg,&_div]:text-app-secondary-foreground-muted-plus bg-transparent w-full p-2 px-2 rounded-xl hover:[&_svg,&_div]:text-app-primary-foreground border border-transparent transition-colors",
          isActive &&
            "bg-app-primary border-white/10 [&_svg,&_div]:text-app-primary-foreground cursor-default"
        )
      }
      {...rest}
    />
  );
};

export const DashboardSidebar = () => {
  return (
    <aside className="fixed top-0 left-0 bottom-0 w-72 p-8 pr-6 pl-12">
      <header className="w-full flex flex-col gap-2">
        <Logo />
      </header>

      <div className="mt-8 h-full flex flex-col gap-4">
        <SidebarGroup>
          <SidebarGroup.Link to="/">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <HomeIcon />}
                Home
              </Fragment>
            )}
          </SidebarGroup.Link>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroup.Title className="mb-1">Content</SidebarGroup.Title>
          <SidebarGroup.Link to="/content-center/dashboard">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <GaugeIcon />}
                Dashboard
              </Fragment>
            )}
          </SidebarGroup.Link>
          <SidebarGroup.Link to="/content-center/titles">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <ScrollTextIcon />}
                Titles
              </Fragment>
            )}
          </SidebarGroup.Link>
          {/* <SidebarGroup.Link to="/content-center/seasons">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <DatabaseZapIcon />}
                Seasons
              </Fragment>
            )}
          </SidebarGroup.Link>
          <SidebarGroup.Link to="/content-center/episodes">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <FolderUp />}
                Episodes
              </Fragment>
            )}
          </SidebarGroup.Link> */}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroup.Title className="mb-1">Media center</SidebarGroup.Title>
          <SidebarGroup.Link to="/media-center/dashboard">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <GaugeIcon />}
                Dashboard
              </Fragment>
            )}
          </SidebarGroup.Link>
          <SidebarGroup.Link to="/media-center/medias">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <ClapperboardIcon />}
                Medias
              </Fragment>
            )}
          </SidebarGroup.Link>
          <SidebarGroup.Link to="/media-center/encodes">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <DatabaseZapIcon />}
                Encodes
              </Fragment>
            )}
          </SidebarGroup.Link>
          <SidebarGroup.Link to="/media-center/uploads">
            {({ isPending }) => (
              <Fragment>
                {isPending ? <Spinner /> : <FolderUp />}
                Uploads
              </Fragment>
            )}
          </SidebarGroup.Link>
        </SidebarGroup>
      </div>
    </aside>
  );
};
