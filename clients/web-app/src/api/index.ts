import { isServer } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";

const baseUrl = "http://localhost:3333/v1";

const token = Cookies.get("token");

console.log(isServer, token);

export const api = axios.create({
  baseURL: baseUrl,
  headers: isServer
    ? {}
    : {
        authorization: `Bearer ${token}`,
      },
});
