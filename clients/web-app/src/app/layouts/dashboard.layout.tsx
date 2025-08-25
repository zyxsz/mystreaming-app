import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { cn } from "@/lib/utils";
import { Link, Outlet, useLocation } from "react-router";
import { Fragment } from "react/jsx-runtime";

const LayoutHeader = () => {
  const location = useLocation();

  const paths = location.pathname.split("/");

  return (
    <header className="px-6 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          {paths.map((path, index) => {
            const fullPath = !path ? "/" : paths.slice(0, index + 1).join("/");

            const isCurrent = fullPath === location.pathname;

            return (
              <Fragment key={path}>
                {index !== 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={fullPath}
                    className={cn(
                      "capitalize",
                      isCurrent &&
                        "text-app-primary-foreground hover:no-underline"
                    )}
                    asChild
                  >
                    <Link to={fullPath}>
                      {path === "/" || path === ""
                        ? "Home"
                        : path.replaceAll("-", " ")}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};

export default function Layout() {
  return (
    <div
      className="pt-12 min-w-screen min-h-screen bg-app-secondary pb-12"
      style={{ paddingLeft: "calc(18rem + 1rem)" }}
    >
      <DashboardSidebar />
      <div
        className="w-full h-full bg-app-primary rounded-tl-4xl rounded-bl-4xl  "
        style={{ minHeight: "calc(100vh - 6rem)" }}
      >
        <LayoutHeader />
        <div className="p-6 pt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
