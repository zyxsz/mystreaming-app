import { create } from "zustand";
import shaka from "shaka-player/dist/shaka-player.compiled";

export type TextTrack = {
  id: number;
  language: string;
  original: shaka.extern.TextTrack;
};

export type AudioTrack = {
  id: number;
  sampleRating: number | null;
  language: string;
  channels: number;
  original: shaka.extern.AudioTrack;
};

export type VideoTrack = {
  id: number;
  bandwidth: number;
  original: shaka.extern.VideoTrack;
};

export type Preview = {
  count: number;
  startAt: number;
  endAt: number;
  data: string;
};

export type Animation =
  | "PLAY"
  | "PAUSE"
  | "MINUS_VOLUME"
  | "PLUS_VOLUME"
  | "FULLSCREEN"
  | "EXIT_FULLSCREEN"
  | "BACKWARD"
  | "FORWARD"
  | "MUTE_VOLUME"
  | "VOLUME_75"
  | "VOLUME_25"
  | "VOLUME_1"
  | "VOLUME_0"
  | null;

type StoragePayload = {
  videoQuality: number | null;
  audioQuality: number | null;
  audioLanguage: string | null;
  textLanguage: string | null;
  volume: number | null;
};

type Store = {
  videoRef: HTMLVideoElement | null;
  player: shaka.Player | null;

  isLoading: boolean;
  isControlsVisible: boolean;
  isControlsFocused: boolean;
  isBuffering: boolean;
  isPlaying: boolean;
  isMuted: boolean;

  currentAnimation: Animation | null;

  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;

  textTracks: TextTrack[];
  audioTracks: AudioTrack[];
  videoTracks: VideoTrack[];

  selectedTextTrack: TextTrack | null;

  selectedAudioLanguage: string | null;

  selectedAudioQuality?: number;
  selectedVideoQuality?: number;

  previews: Preview[];

  isObjectFitCover: boolean;

  actions: {
    seekTo: (time: number) => void;
    seekPlus: (time: number) => void;
    togglePlay: () => void;
    toggleMute: () => void;
    changeVolume: (volume: number) => void;
    changeVolumePlus: (volume: number) => void;
    changeTextTrack: (track: TextTrack | null) => void;
    changeAudioLanguage: (language: string) => void;
    changeVideoQuality: (quality?: number) => void;
    changeAudioQuality: (quality?: number) => void;
    playAnimation: (animation: Animation) => void;
  };

  storage: {
    save: () => void;
    load: () => StoragePayload;
  };
};

export const playerState = create<Store>((set, get) => ({
  player: null,

  videoRef: null,

  isLoading: true,
  isControlsVisible: true,
  isControlsFocused: false,
  isBuffering: false,
  isPlaying: false,
  isMuted: false,

  currentAnimation: null,
  isObjectFitCover: false,

  currentTime: 0,
  duration: 100,
  buffered: 0,
  volume: 100,

  textTracks: [],
  audioTracks: [],
  videoTracks: [],

  selectedTextTrack: null,
  selectedAudioLanguage: null,

  previews: [],

  actions: {
    seekTo(time) {
      const { videoRef } = get();

      if (!videoRef) return;

      set({ isBuffering: true });

      videoRef.currentTime = time;
    },

    seekPlus(time) {
      const { videoRef } = get();

      if (!videoRef) return;

      set({ isBuffering: true });

      videoRef.currentTime += time;

      if (time > 0) {
        get().actions.playAnimation("FORWARD");
      } else {
        get().actions.playAnimation("BACKWARD");
      }
    },
    togglePlay() {
      const { videoRef } = get();

      if (!videoRef) return;

      if (videoRef.paused) {
        videoRef.play();
        get().actions.playAnimation("PLAY");
      } else {
        videoRef.pause();
        get().actions.playAnimation("PAUSE");
      }
    },
    toggleMute() {
      const { videoRef } = get();

      if (!videoRef) return;

      videoRef.muted = !videoRef.muted;

      if (videoRef.muted) {
        set({ currentAnimation: "MUTE_VOLUME" });
      } else {
        set({ currentAnimation: "PLUS_VOLUME" });
      }
    },

    changeVolume(volume) {
      const { videoRef, storage } = get();

      if (!videoRef) return;

      videoRef.volume = volume / 100;

      storage.save();
    },
    changeVolumePlus(volume) {
      const { videoRef, storage, actions } = get();

      if (!videoRef) return;

      const finalVolume = volume + videoRef.volume * 100;

      if (finalVolume < 0) {
        get().actions.playAnimation("VOLUME_75");

        videoRef.volume = 0;
        storage.save();
      }

      if (finalVolume > 100) {
        actions.playAnimation("VOLUME_75");

        videoRef.volume = 100;
        storage.save();

        return;
      }

      if (finalVolume >= 75) {
        actions.playAnimation("VOLUME_75");
      } else if (finalVolume < 75 && finalVolume >= 25) {
        actions.playAnimation("VOLUME_25");
      } else if (finalVolume < 25 && finalVolume >= 1) {
        actions.playAnimation("VOLUME_1");
      } else if (finalVolume < 1) {
        actions.playAnimation("VOLUME_0");
      }

      videoRef.volume = finalVolume / 100;
      storage.save();
    },
    changeTextTrack(track) {
      const { videoRef, player, storage } = get();

      if (!videoRef) return;
      if (!player) return;

      if (track === null) {
        player.setTextTrackVisibility(false);

        set({ selectedTextTrack: null });
        storage.save();
      } else {
        player.setTextTrackVisibility(true);
        player.selectTextTrack(track.original);

        set({ selectedTextTrack: track });
        storage.save();
      }
    },
    changeAudioLanguage(language) {
      const {
        videoRef,
        player,
        storage,
        selectedAudioQuality,
        selectedVideoQuality,
      } = get();

      if (!videoRef) return;
      if (!player) return;

      if (selectedAudioQuality || selectedVideoQuality) {
        const audioGoal = selectedAudioQuality || 0;
        const videoGoal = selectedVideoQuality || 0;
        const audioLanguage = language || null;

        const numberOfTracksWithLanguage =
          player.getVariantTracks().filter((t) => t.language === audioLanguage)
            ?.length > 0;

        const variant =
          audioLanguage && numberOfTracksWithLanguage
            ? player
                .getVariantTracks()
                .filter((t) => t.language === audioLanguage)
                .reduce((prev, cur) =>
                  Math.abs((cur.audioSamplingRate || 0) - audioGoal) +
                    Math.abs((cur.videoBandwidth || 0) - videoGoal) <
                  Math.abs((prev.audioSamplingRate || 0) - audioGoal) +
                    Math.abs((prev.videoBandwidth || 0) - videoGoal)
                    ? cur
                    : prev
                )
            : player
                .getVariantTracks()
                .reduce((prev, cur) =>
                  Math.abs((cur.audioSamplingRate || 0) - audioGoal) +
                    Math.abs((cur.videoBandwidth || 0) - videoGoal) <
                  Math.abs((prev.audioSamplingRate || 0) - audioGoal) +
                    Math.abs((prev.videoBandwidth || 0) - videoGoal)
                    ? cur
                    : prev
                );

        console.log(
          "Changing audio quality select variants with",
          selectedVideoQuality,
          selectedAudioQuality,
          variant
        );

        if (variant) {
          player.selectVariantTrack(variant, true);

          set({
            selectedAudioLanguage: variant.language,
          });
        }
      } else {
        const audioGoal =
          player.getAudioTracks().find((t) => t.active)?.audioSamplingRate || 0;
        const videoGoal =
          player.getVideoTracks().find((t) => t.active)?.bandwidth || 0;
        const audioLanguage = language || null;

        const numberOfTracksWithLanguage =
          player.getVariantTracks().filter((t) => t.language === audioLanguage)
            ?.length > 0;

        const variant =
          audioLanguage && numberOfTracksWithLanguage
            ? player
                .getVariantTracks()
                .filter((t) => t.language === audioLanguage)
                .reduce((prev, cur) =>
                  Math.abs((cur.audioSamplingRate || 0) - audioGoal) +
                    Math.abs((cur.videoBandwidth || 0) - videoGoal) <
                  Math.abs((prev.audioSamplingRate || 0) - audioGoal) +
                    Math.abs((prev.videoBandwidth || 0) - videoGoal)
                    ? cur
                    : prev
                )
            : player
                .getVariantTracks()
                .reduce((prev, cur) =>
                  Math.abs((cur.audioSamplingRate || 0) - audioGoal) +
                    Math.abs((cur.videoBandwidth || 0) - videoGoal) <
                  Math.abs((prev.audioSamplingRate || 0) - audioGoal) +
                    Math.abs((prev.videoBandwidth || 0) - videoGoal)
                    ? cur
                    : prev
                );

        console.log(
          "Changing audio quality select variants with auto",
          variant
        );

        if (variant) {
          player.selectVariantTrack(variant, true);

          set({
            selectedAudioLanguage: variant.language,
          });
        }
      }

      // set({
      //   selectedAudioLanguage: language,
      // });

      storage.save();
    },
    changeVideoQuality(quality) {
      const {
        videoRef,
        player,
        selectedAudioLanguage,
        selectedAudioQuality,
        storage,
      } = get();

      if (!videoRef) return;
      if (!player) return;

      if (!quality) {
        player?.configure("abr.enabled", true);

        set({
          selectedVideoQuality: undefined,
          selectedAudioQuality: undefined,
        });

        storage.save();

        return;
      }

      player?.configure("abr.enabled", false);

      const variant = player
        .getVariantTracks()
        .find((v) =>
          selectedAudioQuality
            ? v.audioSamplingRate === selectedAudioQuality &&
              v.videoBandwidth === quality &&
              v.language === selectedAudioLanguage
            : v.videoBandwidth === quality &&
              v.language === selectedAudioLanguage
        );

      if (!variant) {
        console.log("Variant not found");

        return;
      }

      player.selectVariantTrack(variant, true);

      set({
        selectedVideoQuality: variant.videoBandwidth || undefined,
        selectedAudioQuality: variant.audioSamplingRate || undefined,
      });

      storage.save();
    },
    changeAudioQuality(quality) {
      const {
        videoRef,
        player,
        selectedAudioLanguage,
        selectedAudioQuality,
        selectedVideoQuality,
        storage,
      } = get();

      if (!videoRef) return;
      if (!player) return;

      if (!quality) {
        player?.configure("abr.enabled", true);

        set({
          selectedVideoQuality: undefined,
          selectedAudioQuality: undefined,
        });

        storage.save();
        return;
      }

      player?.configure("abr.enabled", false);
      // player?.configure("abr.clearBufferSwitch", true);

      const variant = player
        .getVariantTracks()
        .find((v) =>
          selectedVideoQuality
            ? v.audioSamplingRate === quality &&
              v.videoBandwidth === selectedVideoQuality &&
              v.language === selectedAudioLanguage
            : v.audioSamplingRate === quality &&
              v.language === selectedAudioLanguage
        );

      if (!variant) {
        console.log("Variant not found");

        return;
      }

      player.selectVariantTrack(variant, true);

      set({
        selectedVideoQuality: variant.videoBandwidth || undefined,
        selectedAudioQuality: variant.audioSamplingRate || undefined,
      });

      storage.save();
    },

    playAnimation(animation) {
      set({ currentAnimation: animation });
    },
  },

  storage: {
    load() {
      const videoQuality = localStorage.getItem("@mys-vq") || null;
      const audioQuality = localStorage.getItem("@mys-aq") || null;
      const audioLanguage = localStorage.getItem("@mys-al") || null;
      const textLanguage = localStorage.getItem("@mys-tl") || null;
      const volume = localStorage.getItem("@mys-vl") || null;

      return {
        videoQuality: videoQuality ? parseInt(videoQuality) : null,
        audioQuality: audioQuality ? parseInt(audioQuality) : null,
        audioLanguage,
        textLanguage,
        volume: volume ? parseInt(volume) : null,
      } satisfies StoragePayload;
    },

    save() {
      const {
        selectedAudioQuality,
        selectedVideoQuality,
        selectedAudioLanguage,
        selectedTextTrack,
        volume,
        isLoading,
        player,
      } = get();

      if (isLoading) return;
      if (!player) return;

      if (selectedVideoQuality) {
        localStorage.setItem("@mys-vq", selectedVideoQuality.toString());
      } else {
        localStorage.removeItem("@mys-vq");
      }
      if (selectedAudioQuality) {
        localStorage.setItem("@mys-aq", selectedAudioQuality.toString());
      } else {
        localStorage.removeItem("@mys-aq");
      }
      if (selectedAudioLanguage) {
        localStorage.setItem("@mys-al", selectedAudioLanguage.toString());
      } else {
        localStorage.removeItem("@mys-al");
      }
      if (selectedTextTrack) {
        localStorage.setItem("@mys-tl", selectedTextTrack.language.toString());
      } else {
        localStorage.removeItem("@mys-tl");
      }
      if (selectedTextTrack) {
        localStorage.setItem("@mys-vl", volume.toString());
      } else {
        localStorage.removeItem("@mys-vl");
      }
    },
  },
}));
