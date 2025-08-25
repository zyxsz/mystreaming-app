import { getSession } from "@/app/sessions.server";
import { apiClient } from "@/services/api";

export const getApiClientSession = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));

  const token = session.get("token");
  if (!token) throw new Error("Token not found");

  return apiClient({
    authorization: `Bearer ${token}`,
  });
};
