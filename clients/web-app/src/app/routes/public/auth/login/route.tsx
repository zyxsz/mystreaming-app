import { Input } from "@/components/fields/input";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { loginSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { apiClient } from "@/services/api";
import { redirect, useNavigate, type ActionFunctionArgs } from "react-router";
import {
  useRemixForm,
  getValidatedFormData,
  RemixFormProvider,
} from "remix-hook-form";
import { commitSession, getSession } from "@/app/sessions.server";
import { login } from "@/api/services/auth.service";
import { FormProvider, useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { parseISO } from "date-fns";

const resolver = zodResolver(loginSchema);
type FormData = z.infer<typeof loginSchema>;

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));

  const { errors, data } = await getValidatedFormData<FormData>(
    request,
    resolver
  );

  if (errors) {
    return errors;
  }

  const sessionData = await login(data).catch(() => null);

  if (!sessionData) return;
  if (!sessionData?.token) return;

  session.set("token", sessionData?.token!);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function Index() {
  const navigate = useNavigate();
  const form = useForm({ resolver });

  const [isSubmitPending, startSubmitTransition] = useTransition();

  const onSubmit = (data: FormData) => {
    console.log(data);

    startSubmitTransition(async () => {
      const response = await login(data).catch((error) => {
        const message = error.message;

        toast.error("Oh noo", {
          description: message || "An error occurred while trying to sign in.",
        });

        return null;
      });

      if (!response) return;

      toast.success("Yeeep", { description: "Signed in successfully" });
      Cookies.set("token", response.token, {
        expires: parseISO(response.expiresAt),
      });

      navigate("/");
    });
  };

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center">
      <header className="flex flex-col items-center gap-2">
        <Logo />
        <p className="text-sm text-app-primary-foreground-muted">
          Fill the fields below to enter in a valid account.
        </p>
      </header>

      <FormProvider {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();

            form.handleSubmit(onSubmit)(e);
          }}
          method="post"
          className="mt-8 w-full max-w-lg flex flex-col gap-4"
        >
          <Input placeholder="Ex: example@mys.com" label="Email" name="email" />
          <Input
            placeholder="Ex: ********"
            label="Password"
            type="password"
            name="password"
          />

          <div className="w-full flex items-center justify-end gap-4">
            <Button onClick={() => form.reset()} variant="link" type="button">
              Cancel
            </Button>
            <Button type="submit">Sign in</Button>
          </div>
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    </div>
  );
}
