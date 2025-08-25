import { treaty } from "@elysiajs/eden";
import { isServer } from "@tanstack/react-query";
import type { App } from "mys-server";
import Cookies from "js-cookie";

export const apiClient = (headers?: Record<string, string>) => {
  if (isServer) {
    console.log("server");

    return treaty<App>("http://localhost:3333", { headers });
  }

  const token = Cookies.get("token");

  return treaty<App>("http://localhost:3333", {
    headers: { ...headers, authorization: `Bearer ${token}` },
  });
};
