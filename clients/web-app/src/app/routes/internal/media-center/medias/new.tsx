import { createMedia } from "@/api/services/medias.service";
import { getUploads } from "@/api/services/uploads.service";
import { queryClient } from "@/app/root";
import { CheckboxInput } from "@/components/fields/checkbox";
import { Input } from "@/components/fields/input";
import { Button } from "@/components/ui/button";
import { ComboboxInput } from "@/components/ui/combobox";
import { GoBackButton } from "@/components/ui/go-back-button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFileSize } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3).max(256),
  uploadId: z.string(),
  autoEncode: z.boolean(),
});

export default function Page() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      autoEncode: true,
    },
  });

  const navigate = useNavigate();
  const [isSubmitPending, startSubmitTransition] = useTransition();

  const handleSearchUpload = async (query: string) => {
    const uploads = await getUploads({ page: 1 });

    return uploads.data.map((upload) => ({
      value: upload.id,
      label: (
        <div className="flex items-center">
          <span
            title={upload.originalName}
            className="block w-fit max-w-48 overflow-hidden text-ellipsis line-clamp-1 text-nowrap"
          >
            {upload.originalName}
          </span>
          {upload.size && (
            <span
              className="ml-4 bg-white rounded-sm px-2 text-xs text-black uppercase font-bold"
              title={formatFileSize(upload.size)}
            >
              {formatFileSize(upload.size)}
            </span>
          )}
        </div>
      ),
    }));
  };

  const onSubmit = (data: z.infer<typeof schema>) => {
    startSubmitTransition(async () => {
      await createMedia(data)
        .then(() => {
          toast.success("Yeeeep", {
            description: "Media created successfully",
          });
        })
        .catch((error) => {
          const message = error.message;

          toast.error("Oopps", {
            description:
              message || "An error occurred while trying to create media",
          });
        });

      await queryClient.refetchQueries({ queryKey: ["medias"] });
      navigate("/media-center/medias");
    });
  };

  const handleCancel = () => {
    navigate("/media-center/medias");
  };

  /*
storages?.data.map((storage) => ({
            value: storage.id,
            label: (
              <span>
                {storage.bucket}
                <span className='ml-2 bg-white rounded-sm px-2 text-xs text-black uppercase font-bold'>
                  {storage.region}
                </span>
              </span>
            ),
          }))
*/
  return (
    <div className="flex flex-col gap-6 max-w-screen-xl">
      <GoBackButton href="/media-center/medias" />

      <FormProvider {...form}>
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();

            form.handleSubmit(onSubmit)(e);
          }}
        >
          <div className="flex-1 flex items-center gap-4">
            <Input
              fieldsetClassname="flex-1"
              name="name"
              label="Media name"
              placeholder="Ex: s01e01 media-show dual"
            />
            <ComboboxInput
              fieldsetClassname="flex-1"
              label="Upload"
              name="uploadId"
              defaultItems={[]}
              placeholder="Select a upload"
              inputPlaceholder="Search for a upload..."
              onSearch={handleSearchUpload}
            />
          </div>

          <CheckboxInput
            name="autoEncode"
            defaultChecked={false}
            fieldsetClassname="flex-row-reverse"
            label={
              <div className="flex flex-row-reverse items-center justify-end gap-2">
                <p className="text-xs text-app-primary-foreground-muted">
                  Auto encode
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="link" className="bg-transparent border-none">
                      <InfoIcon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8} side="left" align="center">
                    <p>
                      This will automatic create a encode and assign it to the
                      media.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            }
          />

          <div className="flex items-center justify-end gap-4">
            <Button
              variant="link"
              type="button"
              onClick={handleCancel}
              disabled={isSubmitPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitPending}>
              {isSubmitPending ? (
                <Fragment>
                  <Spinner size={16} /> Creating...
                </Fragment>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
