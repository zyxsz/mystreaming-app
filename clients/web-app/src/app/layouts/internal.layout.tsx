import { validateSession } from "@/api/services/auth.service";
import { Outlet, redirect, type LoaderFunctionArgs } from "react-router";
import * as cookie from "cookie";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookies = request.headers.get("Cookie");

  if (!cookies) return redirect("/auth/login");

  const token = cookie.parse(cookies)["token"];

  if (!token) return redirect("/auth/login");

  const isValid = await validateSession(token)
    .then(() => true)
    .catch(() => false);
  // .then(() => true)
  // .catch(() => false);

  console.log(isValid);

  if (!isValid) {
    return redirect("/auth/login");
  }

  return { isValid };
}

export default function Layout() {
  return <Outlet />;
}
