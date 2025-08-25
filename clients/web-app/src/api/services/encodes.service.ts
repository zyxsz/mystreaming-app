import { api } from "..";
import type {
  GetEncodesParams,
  GetEncodesResult,
} from "../interfaces/http/encodes/get-encodes";

export const getEncodes = async (params: GetEncodesParams) => {
  return api
    .get<GetEncodesResult>("encodes", { params })
    .then((response) => response.data);
};
