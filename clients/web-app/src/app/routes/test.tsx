import type { GetPlaybackPreviewsResponse } from "@/api/interfaces/http/playbacks/get-playback-previews";
import {
  getPlaybackEncryptionData,
  getPlaybackPreviews,
} from "@/api/services/playbacks.service";
import { Player } from "@/components/player";
import { useEffect, useRef, useState } from "react";

// const videoRef = useRef<HTMLVideoElement>(null);

// useEffect(() => {
//   async function init() {
//     if (!videoRef.current) return;

//     const token =
//       "eyJhbGciOiJIUzI1NiJ9.eyJwbGF5YmFja0lkIjoiZjIyYTdlZTItMTI1OC00NWM0LWJkZTgtMzBlY2VkMDg2MTA3IiwiZXhwIjoxNzUyMjUzOTgwLCJpYXQiOjE3NTE2NDkxODB9.rZUQCmZwcIKaAA92g8FIvyFXuYEQr-GBwXmfnwV6p-U";

//     const dashjs = await import("dashjs");
//     const player = dashjs.MediaPlayer().create();

//     (window as any).player = player;

//     console.log(
//       (dashjs as any).Constants.THROUGHPUT_CALCULATION_MODES
//         .BYTE_SIZE_WEIGHTED_HARMONIC_MEAN
//     );

//     player.updateSettings({
//       streaming: {
//         text: {
//           dispatchForManualRendering: true,
//           defaultEnabled: false,
//         },
//         abr: {
//           initialBitrate: {
//             audio: -1,
//             video: 50000,
//           },
//           // maxBitrate: { audio: -1, video: 50000 },
//           // // minBitrate: { audio: 256, video: 2000 },
//           // autoSwitchBitrate: {
//           //   video: true,
//           //   audio: true,
//           // },
//           throughput: {
//             sampleSettings: {
//               averageLatencySampleAmount: (dashjs as any).Constants
//                 .THROUGHPUT_CALCULATION_MODES.EWMA,
//               increaseScale: 10.9,
//               vod: 5,
//             },
//             ewma: {},
//           },
//           rules: {
//             throughputRule: {
//               active: true,
//             },
//             bolaRule: {
//               active: false,
//             },
//           },
//         },
//       },
//     });

//     player.setProtectionData({
//       "org.w3.clearkey": {
//         clearkeys: {
//           JxroMu4y1q3t8iaDgPfn1g: "tZsdT2UWLmhEOmFMhR0Vhg",
//           bgKLw5max8y3jd33IXlePw: "TVAtnIb3ZT5TU9BYH8Q4-A",
//           "4l_p4W1YSdTATU_fDETQ0Q": "deZ2FYxCY2xqqJdhgFwf9w",
//           "04-p58ZhWBiFU4SbGLp_IA": "ZXMjY7HF96JTPSp3W7jTOQ",
//           Y_sOPyXtq9Vhs0wQRmwS_w: "Z32vF2IeLKK_PFa0J01Rmw",
//           L_JgfiXUYjmA5NKa3Ch1Mw: "ybrqzpeOIoQb-NTxtmbXAQ",
//           y3j3wDWR7SKmyGErLENJDQ: "TOnQ49l2UKifoCLK3pw9sg",
//           "7h3vk5aHAjCL5-U0vrvWWw": "ZNuQsJ-Z9r2NA7M0Of7LaQ",
//           DV_z1LOhxzwbcfKHgDew9w: "mLHTrr0x7wrnBRSSmsUMgA",
//           eTCz6xhXrtgzQ1c5LFca8g: "HEAoEQXIEbN1Cz5lCfa_tQ",
//           FFjiOzMqoGYZGnzztUEpAQ: "GCQFRv38u5dWM-APk-lsCg",
//           "3hrlL7fT0YLBvrhXZxGKfQ": "sN7JfboKEU20dMSvdmwtpA",
//           "-ZbNxk8LZD8KHvZva-uJsw": "ycnMB07tS6LccNBPnyV6rw",
//           njKMWD6UDpHOdKHNth9vPQ: "jxd4GttINDyRO8By6jnnhg",
//           "tx9bq5DD8nnJaa3uD-xP6g": "Z7Tt1Z-pJmLDFJJHjhNLAA",
//           "ZVSyFj8Bp-NecW1qretfRA": "RHPEk8z4YT9Ijim6OzoS6A",
//           kqXBafJI0g58sQcnQZq6ZA: "4sSu5AtiiYQkffeCNrl6Yg",
//           "gscn_nZf7t-yhy4tKCwLlg": "G5Bj_zsw_zE4XxvevJs3Vg",
//         },
//       },
//     });

//     player.initialize(
//       videoRef.current,
//       `http://localhost:3333/v1/playbacks/manifest?token=${encodeURIComponent(
//         token
//       )}`,
//       false
//     );

//     return;
//   }

//   init();
// }, [videoRef]);

type Media = {
  encryption: object;
  previews: {
    count: number;
    startAt: number;
    endAt: number;
    data: string;
  }[];
};

export default function Page() {
  const [media, setMedia] = useState<Media | null>(null);

  // const token =
  //   "eyJhbGciOiJIUzI1NiJ9.eyJwbGF5YmFja0lkIjoiZGFhZGM1MzUtZjUxYy00YjcyLWE0NmUtZmE2NjI5ZDVmYmJiIiwia2V5IjoiZW5jb2Rlcy81ZGZhZDczOC04MDlhLTQ4NmUtODYyZC1jNzNlZmE5ZDMwZjgiLCJtYW5pZmVzdEtleSI6ImVuY29kZXMvNWRmYWQ3MzgtODA5YS00ODZlLTg2MmQtYzczZWZhOWQzMGY4L21hbmlmZXN0Lm1wZCIsInVzZXJJZCI6IjAxOTZlNGEyLTI5N2UtNzFmMC04NTg4LTZjZmIyYTk0ZmJhMiIsIm1lZGlhSWQiOiJhZDcxNmE3MS04MmEwLTQzMDUtYTIwMy0xMGQ3MmVjNzQzMjIiLCJlbmNvZGVJZCI6IjVkZmFkNzM4LTgwOWEtNDg2ZS04NjJkLWM3M2VmYTlkMzBmOCIsImV4cCI6MTc1MzI4NjkzMSwiaWF0IjoxNzUyNjgyMTMxfQ._T7NosOm8Y86-IZ3cekZlD7c8jxS9zwWxroc3EULp5k";

  // const token =
  //   "eyJhbGciOiJIUzI1NiJ9.eyJwbGF5YmFja0lkIjoiMWUwYWU2YmMtMmUzNy00M2I2LTg4YzMtN2M5YjgyY2JjNmFiIiwia2V5IjoiZW5jb2Rlcy80ZDBlM2M5ZC1hYjVlLTQ4OTQtYjAxMC04NGM4Nzk0N2QxNjAiLCJtYW5pZmVzdEtleSI6ImVuY29kZXMvNGQwZTNjOWQtYWI1ZS00ODk0LWIwMTAtODRjODc5NDdkMTYwL21hbmlmZXN0Lm1wZCIsInVzZXJJZCI6IjAxOTZlNGEyLTI5N2UtNzFmMC04NTg4LTZjZmIyYTk0ZmJhMiIsIm1lZGlhSWQiOiIwN2Q0YTJlZC0yZjYwLTRjMTAtODU4Yi01ZTg2NGQwMmFlYTQiLCJlbmNvZGVJZCI6IjRkMGUzYzlkLWFiNWUtNDg5NC1iMDEwLTg0Yzg3OTQ3ZDE2MCIsImV4cCI6MTc1MzI5OTY5NiwiaWF0IjoxNzUyNjk0ODk2fQ.1OjmGrXR4sQ8mWMd9aey4JEfoVxqLEQdszmBYe6A_EQ";

  const token =
    "eyJhbGciOiJIUzI1NiJ9.eyJwbGF5YmFja0lkIjoiOWY4OTY3ZTQtZDdlOC00NGQ4LWFiZDYtZDU2ZWZhYmM4NGQ2Iiwia2V5IjoiZW5jb2Rlcy83YTNhZTJkYy0wZDQyLTRkYWMtOTFkMi1kMjQ4MWYwZTQ2ZDYiLCJtYW5pZmVzdEtleSI6ImVuY29kZXMvN2EzYWUyZGMtMGQ0Mi00ZGFjLTkxZDItZDI0ODFmMGU0NmQ2L21hbmlmZXN0Lm1wZCIsInVzZXJJZCI6IjAxOTZlNGEyLTI5N2UtNzFmMC04NTg4LTZjZmIyYTk0ZmJhMiIsIm1lZGlhSWQiOiIxNzY3MWVlMi1lMTc0LTQyMTMtODhmNS0wNmNjMGU0ZjJhNzEiLCJlbmNvZGVJZCI6IjdhM2FlMmRjLTBkNDItNGRhYy05MWQyLWQyNDgxZjBlNDZkNiIsImV4cCI6MTc1MzQwNjUxNSwiaWF0IjoxNzUyODAxNzE1fQ.w2bJYz0aDEjk5553fJJyF44viZSVXfR2ojW0Yw3uSUI";

  useEffect(() => {
    async function init() {
      const encryptionData = await getPlaybackEncryptionData(token);
      const previews = await getPlaybackPreviews(token).catch(() => []);

      console.log(encryptionData);

      setMedia({ encryption: encryptionData, previews });
    }

    init();
  }, [token]);

  return (
    <div className="w-screen h-screen">
      {media && (
        <Player
          encryptionData={media.encryption}
          previews={media.previews}
          src={`http://localhost:3333/v1/playbacks/manifest?token=${token}`}
        />
      )}
    </div>
  );
}
