import { validateSession } from "@/api/services/auth.service";

import { Outlet, redirect, type LoaderFunctionArgs } from "react-router";
import * as cookie from "cookie";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookies = request.headers.get("Cookie");

  if (!cookies) return { isValid: false };

  const token = cookie.parse(cookies)["token"];

  const isValid = await validateSession(token)
    .then((e) => {
      console.log(e);

      return true;
    })
    .catch((e) => {
      console.log(e.response.data);

      return false;
    });

  if (isValid) {
    return redirect("/");
  }

  return { isValid };
}

export default function Layout() {
  return <Outlet />;
}
