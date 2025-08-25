import {
  completeUpload,
  createUpload,
  getUploadPresignedUrls,
} from "@/api/services/uploads.service";
import { mapLimit } from "async";
import axios from "axios";
import { create } from "zustand";

type Upload = {
  parts: {
    number: number;
    progress: number;
    completed: boolean;
    etag?: string;
  }[];
};

type UploadStore = {
  uploads: Record<string, Upload>;
  uploadFiles: (
    files: File[]
  ) => Promise<Array<{ file: File; uploadId: string }>>;
};

export const uploadStore = create<UploadStore>((set, get) => ({
  uploads: {},
  async uploadFiles(files) {
    return await mapLimit(files, 1, async (file: File) => {
      const upload = await createUpload({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const presignedUrls = await getUploadPresignedUrls(upload.id);

      const partSize = 10000000;

      const numberOfParts = Math.ceil(file.size / partSize);

      const parts: number[] = Array.from(
        { length: numberOfParts },
        (_, i) => i
      );

      const fileId = file.name + file.size;

      set((state) => ({
        uploads: {
          ...state.uploads,
          [fileId]: {
            parts: Array.from({ length: numberOfParts }, (_, i) => i).map(
              (v) => ({
                number: v + 1,
                progress: 0,
                completed: false,
              })
            ),
          },
        },
      }));

      const uploadPartsResponses = await mapLimit(
        parts,
        4,
        async (i: number) => {
          const start = i * partSize;
          const end = Math.min(start + partSize, file.size);
          const blob = file.slice(start, end);

          return await uploadPart(
            fileId,
            blob,
            presignedUrls[i],
            i + 1,
            file.type
          );
        }
      );

      await completeUpload(upload.id, { parts: uploadPartsResponses });

      return { uploadId: upload.id, file };
    });
  },
}));

async function uploadPart(
  fileId: string,
  fileChunk: Blob,
  presignedUrl: string,
  partNo: number,
  fileType: string
) {
  const upload: () => Promise<string> = async () =>
    await axios
      .put(presignedUrl, fileChunk, {
        headers: { "content-type": fileType },
        onUploadProgress(progressEvent) {
          uploadStore.setState((state) => ({
            uploads: {
              ...state.uploads,
              [fileId]: {
                ...state.uploads[fileId],
                parts: state.uploads[fileId].parts.map((part) => {
                  if (part.number === partNo) {
                    return {
                      ...part,
                      progress: parseFloat(
                        ((progressEvent?.progress || 0) * 100).toFixed(2)
                      ),
                    };
                  }

                  return part;
                }),
              },
            },
          }));
        },
      })
      .then((r) => r.headers["etag"] ?? "")
      .catch(async (e) => {
        console.log(e, "trying again...");

        return await upload();
      });

  // const uploadResponse = await axios
  //   .put(presignedUrl, fileChunk, {
  //     headers: { "content-type": fileType },
  //     onUploadProgress(progressEvent) {
  //       uploadStore.setState((state) => ({
  //         uploads: {
  //           ...state.uploads,
  //           [fileId]: {
  //             ...state.uploads[fileId],
  //             parts: state.uploads[fileId].parts.map((part) => {
  //               if (part.number === partNo) {
  //                 return {
  //                   ...part,
  //                   progress: parseFloat(
  //                     ((progressEvent?.progress || 0) * 100).toFixed(2)
  //                   ),
  //                 };
  //               }

  //               return part;
  //             }),
  //           },
  //         },
  //       }));
  //     },
  //   })
  //   .catch((e) => {
  //     console.log(e);
  //     console.log(e.response.data);
  //   });

  // if (!uploadResponse) return { ETag: "", PartNumber: partNo };

  const etag = await upload();

  if (!etag) return { ETag: "", PartNumber: partNo };

  uploadStore.setState((state) => ({
    uploads: {
      ...state.uploads,
      [fileId]: {
        ...state.uploads[fileId],
        parts: state.uploads[fileId].parts.map((part) => {
          if (part.number === partNo) {
            return {
              ...part,
              progress: 100,
              completed: true,
              etag,
            };
          }

          return part;
        }),
      },
    },
  }));

  return {
    ETag: etag as string,
    PartNumber: partNo,
  };
}
