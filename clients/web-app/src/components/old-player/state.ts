import axios from "axios";
import { addSeconds, isBefore } from "date-fns";
import type { MediaPlaybackSessionResponse, Preview } from "@/types/app";
import { create } from "zustand";
import { apiClient } from "@/services/api";
import pkg from "lodash";
import { createPlayback } from "@/api/services/playbacks.service";
// import lodash from "lodash";

const throttle = pkg.throttle;

type Track = {
  id: string;
  index: number;
  language: string;
  codec: string;
  mimeType: string;
  channels: number;
  original: dashjs.MediaInfo;
};

type TextTrack = {
  id: string;
  key: string | string[];
  language: string;
  type: "LOCAL" | "EXTERNAL";
};

type Animation =
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

export type VideoQuality = {
  bitrate: number;
  width: number;
  height: number;
};

export type AudioQuality = {
  bitrate: number;
  language: string;
  channels: number;
};

type PlayerState = {
  isPaused: boolean;
  isMuted: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  buffered?: number;
  textTracks: TextTrack[];
  audioTracks: Track[];

  videoQualities: VideoQuality[];
  audioQualities: AudioQuality[];

  currentTextTrack: TextTrack | null;
  isControlsVisible: boolean;
  isControlsFocused: boolean;
  currentAnimation: Animation;
  isLoading: boolean;

  currentAudioQuality: number | null;
  currentAudioChannel: number | null;
  currentAudioLanguage: string | null;

  currentVideoQuality: number | null;
};

type Cue = {
  startAt: number;
  endAt: number;
  content: string;
};

type CaptionState = {
  cues: Cue[];
  currentCues: Cue[];
};

type PlaybackSession = {
  token: string;

  endpoints: {
    manifest: string;
    encryption: string;
    keepAlive: string;
  };
  keepAliveIn: number;
};

type Store = {
  titleId?: string;
  episodeId?: string;
  currentProgress?: number;

  nextKeepAliveAt: Date | null;
  isLoading: boolean;
  mediaId: string | null;
  session: PlaybackSession | null;
  player: dashjs.MediaPlayerClass | null;
  videoElement: HTMLVideoElement | null;
  subtitlesContainerElement: HTMLDivElement | null;
  containerElement: HTMLDivElement | null;
  playerState: PlayerState | null;
  captionState: CaptionState;
  previews: Preview[];

  init: (
    videoElement: HTMLVideoElement,
    subtitlesContainerElement: HTMLDivElement,
    containerElement: HTMLDivElement,
    mediaId: string,
    details?: {
      titleId?: string;
      episodeId?: string;
      currentProgress?: number;
    }
  ) => Promise<MediaPlaybackSessionResponse>;
  destroy: () => void;
  configurePlayerNetwork: () => Promise<void>;
  configurePlayerEncryption: () => Promise<void>;
  loadPlayerPreviews: () => Promise<void>;
  configurePlayerSubtitles: () => void;
  configurePlayerEvents: () => void;
  configureContainerEvents: () => void;
  removePlayerEvents?: () => void;
  removeContainerEvents?: () => void;
  getPlayerTracks: () => {
    textTracks: TextTrack[];
    audioTracks: Track[];
    currentAudioLanguage: string | null;
    currentAudioQuality: number | null;
    currentAudioChannel: number | null;
    videoQualities: VideoQuality[];
    audioQualities: AudioQuality[];
    currentVideoQuality: number | null;
  } | void;
  updatePlayerState: (updatedState: Partial<PlayerState>) => void;
  playerActions: {
    togglePlay: () => void;
    toggleMute: () => void;
    changeVolume: (volume: number) => void;
    seekPlus: (seconds: number) => void;
    seekTo: (currentTime: number) => void;
    changeTextTrack: (textTrack: TextTrack | null, keyIndex?: number) => void;
    changeAudioTrack: (lang: string) => void;
    playAnimation: (animation: Animation) => void;
    changeVolumePlus: (value: number) => void;
    changeAudioChannels: (channels: number) => void;
    changeVideoQuality: (quality: number) => void;
    changeAudioQuality: (quality: number) => void;
  };
  loadTextTrack: (track: TextTrack, keyIndex?: number) => Promise<void>;
  loadFromLocalStorage: () => {
    volume: string | null;
  };
  saveProgress: pkg.DebouncedFuncLeading<() => Promise<void>>;
  keepAlive: () => void;
};

let mouseMoveTimeout: NodeJS.Timeout;
let mouseLeaveTimeout: NodeJS.Timeout;

export const usePlayerStore = create<Store>((set, get, store) => ({
  currentAudioLanguage: null,
  currentAudioQuality: null,

  nextKeepAliveAt: null,
  isLoading: true,
  mediaId: null,
  session: null,
  player: null,
  videoElement: null,
  subtitlesContainerElement: null,
  containerElement: null,
  playerState: null,
  previews: [],
  captionState: { cues: [], currentCues: [] },
  init: async (
    videoElement: HTMLVideoElement,
    subtitlesContainerElement: HTMLDivElement,
    containerElement: HTMLDivElement,
    mediaId: string,
    details?: {
      titleId?: string;
      episodeId?: string;
      currentProgress?: number;
    }
  ) => {
    set({ isLoading: true });

    console.log("Initializing player for media: ", mediaId);

    const session = await createPlayback({ mediaId });

    if (!session) {
      console.log("Unable to create playback session", session);

      throw new Error("Unable to create playback session" + session);
    }

    // const session = await axios
    //   .post<MediaPlaybackSessionResponse>(
    //     `http://localhost:3333/medias/${mediaId}/playback`,
    //     undefined,
    //     {
    //       withCredentials: true,
    //     }
    //   )
    //   .then((res) => res.data);

    set({
      mediaId,
      session: session as unknown as MediaPlaybackSessionResponse,
      videoElement,
      subtitlesContainerElement,
      containerElement,
      titleId: details?.titleId,
      episodeId: details?.episodeId,
      currentProgress: details?.currentProgress,
    });

    const dashjs = await import("dashjs");
    const player = dashjs.MediaPlayer().create();

    set({ player });

    (window as any).player = player;

    await get().configurePlayerNetwork();
    await get().configurePlayerEncryption();

    get().configurePlayerEvents();
    get().configureContainerEvents();

    player.updateSettings({
      streaming: {
        text: {
          dispatchForManualRendering: true,
          defaultEnabled: false,
        },
      },
    });

    player.initialize(
      videoElement,
      `${session.endpoints.manifest}?token=${encodeURIComponent(
        session.token
      )}`,
      false
    );

    // get().configurePlayerSubtitles();

    await get().loadPlayerPreviews();

    return session as unknown as MediaPlaybackSessionResponse;
  },
  configurePlayerNetwork: async () => {
    const { player, session } = get();

    if (!player || !session) return;

    // player.addRequestInterceptor((request) => {
    //   if (
    //     request.cmcd?.ot === "v" ||
    //     request.cmcd?.ot === "i" ||
    //     request.cmcd?.ot === "a"
    //   ) {
    //     const streamKey = request.url.replaceAll(
    //       session.endpoints.manifest.replace("manifest", ""),
    //       ""
    //     );

    //     const range = request.headers?.["Range"]?.replaceAll("bytes=", "");

    //     if (!range && request.url.includes("ttml")) {
    //       request.url = `${
    //         session.endpoints.subtitles
    //       }?token=${encodeURIComponent(
    //         session.token
    //       )}&stream=${encodeURIComponent(btoa(streamKey))}`;

    //       return Promise.resolve(request);
    //     }

    //     if (!range) return Promise.resolve(request);

    //     request.url = `${
    //       session.endpoints.range
    //     }/${range}?token=${encodeURIComponent(
    //       session.token
    //     )}&stream=${encodeURIComponent(btoa(streamKey))}`;
    //   }

    //   return Promise.resolve(request);
    // });

    player.updateSettings({
      streaming: {
        protection: {
          keepProtectionMediaKeys: true,
        },
        abr: {
          autoSwitchBitrate: { audio: false, video: false },
        },
      },
    });
  },
  configurePlayerSubtitles: () => {
    const { player, subtitlesContainerElement } = get();

    if (!player) return;

    if (subtitlesContainerElement) {
      player.attachTTMLRenderingDiv(subtitlesContainerElement);
    }
  },
  configurePlayerEncryption: async () => {
    const { player, session } = get();

    if (!player || !session) return;

    const encryption = await axios
      .get(session.endpoints.encryption, { params: { token: session.token } })
      .then((r) => r.data);

    player.setProtectionData({
      ...encryption,
    });
  },
  loadPlayerPreviews: async () => {
    const { player, session } = get();

    if (!player || !session) return;

    // const previews = await axios
    //   .get<Preview[]>(session.endpoints.previews, {
    //     params: { token: session.token },
    //   })
    //   .then((r) => r.data);

    // set({ previews });
  },
  configurePlayerEvents: () => {
    const { videoElement } = get();

    if (!videoElement) return;

    const handleLoaded = () => {
      const tracks = get().getPlayerTracks();

      const { currentProgress } = get();
      const { buffered, duration, muted, paused, volume, currentTime } =
        videoElement;

      const { volume: localVolume } = get().loadFromLocalStorage();

      if (currentProgress) {
        videoElement.currentTime = currentProgress;
      }

      const defaultState = {
        duration: duration,
        isMuted: muted,
        isPaused: paused,
        volume: localVolume ? parseFloat(localVolume) : volume * 100,
        currentTime: currentProgress ? currentProgress : currentTime,
        buffered: buffered.length
          ? (buffered.end(buffered.length - 1) / duration) * 100
          : undefined,

        textTracks: tracks?.textTracks ? tracks.textTracks : [],
        currentTextTrack: null,
        audioTracks: tracks?.audioTracks ? tracks.audioTracks : [],
        currentAudioLanguage: tracks ? tracks.currentAudioLanguage : null,
        currentAudioQuality: tracks ? tracks.currentAudioQuality : null,
        currentAudioChannel: tracks ? tracks.currentAudioChannel : null,

        audioQualities: tracks ? tracks.audioQualities : [],
        videoQualities: tracks ? tracks.videoQualities : [],
        currentVideoQuality: tracks ? tracks.currentVideoQuality : null,
        isControlsFocused: false,
        isControlsVisible: false,
        currentAnimation: null,
        isLoading: false,
      } satisfies PlayerState;

      set({
        isLoading: false,
        playerState: defaultState,
      });

      videoElement.play();
    };

    const handleTimeUpdate = () => {
      const { buffered, duration, currentTime } = videoElement;

      get().updatePlayerState({
        currentTime,
        duration,
        buffered: buffered.length
          ? (buffered.end(buffered.length - 1) / duration) * 100
          : undefined,
      });
    };

    const handlePlay = () => {
      get().updatePlayerState({ isPaused: videoElement.paused });
    };

    const handlePause = () => {
      get().updatePlayerState({ isPaused: videoElement.paused });
    };

    const handleWaiting = () => {
      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, isLoading: true }
          : state.playerState,
      }));
    };

    const handleCanPlay = () => {
      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, isLoading: false }
          : state.playerState,
      }));
    };

    videoElement.addEventListener("loadedmetadata", handleLoaded);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("waiting", handleWaiting);
    videoElement.addEventListener("canplay", handleCanPlay);

    const removePlayerEvents = () => {
      const { videoElement } = get();

      if (!videoElement) return;

      videoElement.removeEventListener("loadedmetadata", handleLoaded);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("waiting", handleWaiting);
      videoElement.removeEventListener("canplay", handleCanPlay);
    };

    set({ removePlayerEvents });
  },
  configureContainerEvents: () => {
    const { containerElement } = get();

    if (!containerElement) return;

    const handleMouseMove = () => {
      if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, isControlsVisible: true }
          : state.playerState,
      }));

      mouseMoveTimeout = setTimeout(() => {
        set((state) => ({
          playerState: state.playerState
            ? { ...state.playerState, isControlsVisible: false }
            : state.playerState,
        }));
      }, 2000);
    };

    const handleMouseEnter = () => {
      if (mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout);

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, isControlsVisible: true }
          : state.playerState,
      }));
    };

    const handleMouseLeave = () => {
      mouseLeaveTimeout = setTimeout(() => {
        set((state) => ({
          playerState: state.playerState
            ? { ...state.playerState, isControlsVisible: false }
            : state.playerState,
        }));
      }, 200);
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Space":
          event.preventDefault();
          usePlayerStore.getState().playerActions.togglePlay();
          break;
        case "KeyM":
          event.preventDefault();
          usePlayerStore.getState().playerActions.toggleMute();
          break;
        case "KeyF":
          event.preventDefault();
          // usePlayerStore.getState().toggleFullscreen();
          break;

        case "ArrowUp":
          event.preventDefault();
          usePlayerStore.getState().playerActions.changeVolumePlus(10);
          break;

        case "ArrowDown":
          event.preventDefault();
          usePlayerStore.getState().playerActions.changeVolumePlus(-10);
          break;

        case "ArrowLeft":
          event.preventDefault();
          usePlayerStore.getState().playerActions.seekPlus(-10);

          break;

        case "ArrowRight":
          event.preventDefault();
          usePlayerStore.getState().playerActions.seekPlus(10);
          break;
        case "KeyT":
          event.preventDefault();
          // usePlayerStore.setState((state) => ({
          //   isCoverMode: !state.isCoverMode,
          // }));
          break;
      }
    };

    containerElement.addEventListener("mousemove", handleMouseMove);
    containerElement.addEventListener("mouseenter", handleMouseEnter);
    containerElement.addEventListener("mouseleave", handleMouseLeave);
    containerElement.addEventListener("keyup", handleKeyPress);

    const removeContainerEvents = () => {
      const { containerElement } = get();

      if (!containerElement) return;

      containerElement.removeEventListener("mousemove", handleMouseMove);
      containerElement.removeEventListener("mouseenter", handleMouseEnter);
      containerElement.removeEventListener("mouseleave", handleMouseLeave);
      containerElement.removeEventListener("keyup", handleKeyPress);
    };

    set({ removeContainerEvents });
  },
  getPlayerTracks: () => {
    const { player } = get();

    if (!player) return;

    const textTracks = (
      player.getManifest() as any
    ).Period[0].AdaptationSet.filter((a: any) => a.contentType === "text").map(
      (adaptation: any) =>
        ({
          id: adaptation.id,
          language: adaptation.lang,
          key: adaptation.Representation.map((r: any) => r.BaseURL[0].__text),
          type: "LOCAL",
        } satisfies TextTrack)
    ) satisfies TextTrack[];

    const audioTracks = player.getTracksFor("audio").map(
      (track, index) =>
        ({
          index,
          id: track.id as string,
          codec: track.codec as string,
          language: track.lang as string,
          mimeType: track.mimeType as string,
          original: track,
          channels: parseInt(track.audioChannelConfiguration?.[0].value || "2"),
        } satisfies Track)
    );

    const currentAudioTrack = player.getCurrentTrackFor("audio");
    const currentVideoTrack = player.getCurrentTrackFor("video");

    const audioQualities = audioTracks.map(
      (track) =>
        ({
          bitrate: track.original.bitrateList[0].bandwidth || 0,
          channels: parseFloat(
            track.original.audioChannelConfiguration?.[0].value || "2"
          ),
          language: track.language,
        } satisfies AudioQuality)
    );
    const videoQualities = player.getTracksFor("video").map(
      (track) =>
        ({
          bitrate: track.bitrateList[0].bandwidth || 0,
          width: track.bitrateList[0].width || 0,
          height: track.bitrateList[0].height || 0,
        } satisfies VideoQuality)
    );

    return {
      textTracks,
      audioTracks: audioTracks,
      currentAudioLanguage: currentAudioTrack?.lang || null,
      currentAudioQuality: currentAudioTrack?.bitrateList[0].bandwidth || null,
      currentAudioChannel:
        parseFloat(
          currentAudioTrack?.audioChannelConfiguration?.[0].value || "2"
        ) || null,
      currentVideoQuality: currentVideoTrack?.bitrateList[0].bandwidth || null,
      audioQualities,
      videoQualities,
    };
  },
  destroy: () => {
    console.log("Destroying player for media: ", get().mediaId);

    get().removePlayerEvents?.();
    get().player?.destroy();

    set(store.getInitialState());
  },
  updatePlayerState: (updatedState: Partial<PlayerState>) => {
    set((state) => ({
      playerState: state.playerState
        ? { ...state.playerState, ...updatedState }
        : state.playerState,
    }));
  },
  loadTextTrack: async (track: TextTrack, keyIndex?: number) => {
    const { session } = get();

    if (!session) return;

    if (track.type === "LOCAL") {
      const key = keyIndex ? track.key[keyIndex] : track.key[0];

      // const data = await axios
      //   .get(session.endpoints.subtitles, {
      //     params: {
      //       token: session.token,
      //       stream: btoa(keyIndex ? track.key[keyIndex] : track.key[0]),
      //     },
      //   })
      //   .then((response) => response.data);

      // if (key.endsWith("ttml")) {
      //   const parser = new DOMParser();
      //   const parsed = parser.parseFromString(data, "application/xml");

      //   const content = parsed.querySelectorAll("p");

      //   const cues = Array.from(content).map((element) => {
      //     const startAt = element.attributes.getNamedItem("begin")?.value;
      //     const endAt = element.attributes.getNamedItem("end")?.value;

      //     return {
      //       startAt: startAt ? parseTime(startAt) : 0,
      //       endAt: endAt ? parseTime(endAt) : 0,
      //       content: element.innerHTML,
      //     };
      //   });

      //   set({ captionState: { cues, currentCues: [] } });

      //   return;
      // }
    }
  },
  playerActions: {
    playAnimation: (animation: Animation) => {
      console.log(animation);

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, currentAnimation: animation }
          : state.playerState,
      }));
    },
    togglePlay: () => {
      const { playerState } = get();

      if (!playerState) return;

      if (playerState.isPaused) {
        get().playerActions.playAnimation("PLAY");
      } else {
        get().playerActions.playAnimation("PAUSE");
      }

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, isPaused: !state.playerState.isPaused }
          : state.playerState,
      }));
    },
    toggleMute: () => {
      const { playerState } = get();

      if (!playerState) return;

      if (playerState.isMuted) {
        get().playerActions.playAnimation("PLUS_VOLUME");
      } else {
        get().playerActions.playAnimation("MUTE_VOLUME");
      }

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, isMuted: !playerState.isMuted }
          : state.playerState,
      }));
    },
    changeVolume: (volume: number) => {
      const { playerState } = get();

      if (!playerState) return;

      if (volume < 0) {
        set({
          playerState: { ...playerState, volume: 0 },
        });
      } else if (volume > 100) {
        set({
          playerState: { ...playerState, volume: 100 },
        });
      } else {
        set({
          playerState: { ...playerState, volume },
        });
      }
    },
    changeVolumePlus: (value: number) => {
      const { playerState } = get();

      if (!playerState) return;

      const finalVolume = value + playerState.volume;

      if (finalVolume < 0) {
        get().playerActions.playAnimation("VOLUME_0");

        set((state) => ({
          playerState: state.playerState
            ? { ...state.playerState, volume: 0 }
            : state.playerState,
        }));

        return;
      }

      if (finalVolume > 100) {
        get().playerActions.playAnimation("VOLUME_75");

        set((state) => ({
          playerState: state.playerState
            ? { ...state.playerState, volume: 100 }
            : state.playerState,
        }));

        return;
      }

      if (finalVolume >= 75) {
        get().playerActions.playAnimation("VOLUME_75");
      } else if (finalVolume < 75 && finalVolume >= 25) {
        get().playerActions.playAnimation("VOLUME_25");
      } else if (finalVolume < 25 && finalVolume >= 1) {
        get().playerActions.playAnimation("VOLUME_1");
      } else if (finalVolume < 1) {
        get().playerActions.playAnimation("VOLUME_0");
      }

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, volume: finalVolume }
          : state.playerState,
      }));
    },
    seekPlus: (seconds: number) => {
      const { videoElement } = get();
      if (!videoElement) return;

      if (seconds > 0) {
        get().playerActions.playAnimation("FORWARD");
      } else {
        get().playerActions.playAnimation("BACKWARD");
      }

      videoElement.currentTime = videoElement.currentTime + seconds;
    },
    seekTo: (currentTime: number) => {
      const { videoElement, playerState } = get();
      if (!videoElement) return;

      if (currentTime < 0) {
        videoElement.currentTime = 0;
      } else if (playerState?.duration && currentTime > playerState.duration) {
        videoElement.currentTime = playerState.duration;
      } else {
        videoElement.currentTime = currentTime;
      }
    },
    changeTextTrack: (textTrack: TextTrack | null, keyIndex?: number) => {
      const { playerState, loadTextTrack } = get();

      if (!playerState) return;

      if (textTrack) {
        loadTextTrack(textTrack, keyIndex);
      }

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, currentTextTrack: textTrack }
          : state.playerState,
      }));
    },
    changeAudioTrack: (lang: string) => {
      const { playerState } = get();

      if (!playerState) return;

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, currentAudioLanguage: lang }
          : state.playerState,
      }));
    },
    changeAudioChannels(channels) {
      const { playerState } = get();

      if (!playerState) return;

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, currentAudioChannel: channels }
          : state.playerState,
      }));
    },
    changeVideoQuality(quality) {
      const { playerState } = get();

      if (!playerState) return;

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, currentVideoQuality: quality }
          : state.playerState,
      }));
    },
    changeAudioQuality(quality) {
      const { playerState } = get();

      if (!playerState) return;

      set((state) => ({
        playerState: state.playerState
          ? { ...state.playerState, currentAudioQuality: quality }
          : state.playerState,
      }));
    },
  },
  loadFromLocalStorage: () => {
    const volume = localStorage.getItem("@my-streaming:volume");

    return { volume: volume };
  },
  saveProgress: throttle(async () => {
    const { playerState, titleId, episodeId } = get();

    if (!playerState) return;
    if (!titleId) return;

    const percentage = (playerState.currentTime / playerState.duration) * 100;

    // await apiClient().v1.progress.save.put({
    //   titleId: titleId,
    //   episodeId: episodeId ? episodeId : undefined,
    //   completed: percentage >= 98,
    //   currentTime: playerState.currentTime,
    //   totalDuration: playerState.duration,
    //   percentage: percentage,
    // });
  }, 5000),
  keepAlive: async () => {
    const { nextKeepAliveAt, session, playerState } = get();

    if (playerState?.isPaused) return;
    if (!session || !playerState) return;
    if (nextKeepAliveAt && isBefore(new Date(), nextKeepAliveAt)) return;

    set({ nextKeepAliveAt: addSeconds(new Date(), session.keepAliveIn) });

    await axios
      .post(session.endpoints.keepAlive, {
        token: session.token,
        currentTime: playerState?.currentTime || 0,
      })
      .then((r) => r.data);
  },
}));

usePlayerStore.subscribe((state, prevState) => {
  if (state.playerState) {
    if (state.playerState.isPaused !== prevState.playerState?.isPaused) {
      if (state.playerState.isPaused) {
        state.videoElement?.pause();
      } else {
        state.videoElement?.play();
      }
    }

    if (
      state.playerState.isMuted !== prevState.playerState?.isMuted &&
      state.videoElement
    ) {
      if (state.playerState.isMuted) {
        state.videoElement.muted = true;
      } else {
        state.videoElement.muted = false;
      }
    }

    if (
      state.playerState.volume !== prevState.playerState?.volume &&
      state.videoElement
    ) {
      state.videoElement.volume = state.playerState.volume / 100;
    }

    if (
      (state.playerState.currentAudioChannel !==
        prevState.playerState?.currentAudioChannel ||
        state.playerState.currentAudioQuality !==
          prevState.playerState?.currentAudioQuality ||
        state.playerState.currentAudioLanguage !==
          prevState.playerState?.currentAudioLanguage) &&
      state.player
    ) {
      if (state.playerState.currentAudioLanguage) {
        const audioTracks = state.player.getTracksFor("audio");

        const goal = state.playerState.currentAudioQuality || 0;

        const newTrackWithChannels = audioTracks
          .filter(
            (track) =>
              track.lang === state.playerState?.currentAudioLanguage &&
              parseFloat(track.audioChannelConfiguration?.[0].value || "2") ===
                state.playerState.currentAudioChannel
          )
          .reduce((prev, cur) =>
            Math.abs((cur.bitrateList[0].bandwidth || 0) - goal) <
            Math.abs((prev.bitrateList[0].bandwidth || 0) - goal)
              ? cur
              : prev
          );

        console.log(newTrackWithChannels);

        if (newTrackWithChannels) {
          state.player.setCurrentTrack(newTrackWithChannels);
          usePlayerStore.setState((state) => ({
            ...state,
            playerState: state.playerState
              ? {
                  ...state.playerState,
                  currentAudioQuality:
                    newTrackWithChannels.bitrateList[0].bandwidth || 0,
                }
              : state.playerState,
          }));
        }

        if (!newTrackWithChannels) {
          console.log("Checking for tracks without channels");

          const newTrackWithoutChannels = audioTracks
            .filter(
              (track) => track.lang === state.playerState?.currentAudioLanguage
            )
            .reduce((prev, cur) =>
              Math.abs((cur.bitrateList[0].bandwidth || 0) - goal) <
              Math.abs((prev.bitrateList[0].bandwidth || 0) - goal)
                ? cur
                : prev
            );

          console.log(newTrackWithoutChannels);

          if (newTrackWithoutChannels) {
            state.player.setCurrentTrack(newTrackWithoutChannels);
            usePlayerStore.setState((state) => ({
              ...state,
              playerState: state.playerState
                ? {
                    ...state.playerState,
                    currentAudioChannel: parseFloat(
                      newTrackWithoutChannels.audioChannelConfiguration?.[0]
                        .value || "2"
                    ),
                    currentAudioQuality:
                      newTrackWithoutChannels.bitrateList[0].bandwidth || 0,
                  }
                : state.playerState,
            }));
          }
        }
      }
    }

    if (
      state.playerState.currentVideoQuality !==
        prevState.playerState?.currentVideoQuality &&
      state.player
    ) {
      const videoTrack = state.player
        .getTracksFor("video")
        .find(
          (track) =>
            track.bitrateList[0].bandwidth ===
            state.playerState?.currentVideoQuality
        );

      if (videoTrack) state.player.setCurrentTrack(videoTrack);
    }

    if (
      state.playerState.currentTime !== prevState.playerState?.currentTime &&
      state.playerState.currentTextTrack
    ) {
      const currentTime = state.playerState.currentTime;

      const currentCues = state.captionState.cues.filter(
        (c) => c.startAt <= currentTime && c.endAt >= currentTime
      );

      usePlayerStore.setState((state) => ({
        captionState: { ...state.captionState, currentCues: currentCues },
      }));
    }

    if (state.playerState.volume !== prevState.playerState?.volume) {
      localStorage.setItem(
        "@my-streaming:volume",
        state.playerState.volume.toString()
      );
    }

    if (state.playerState.currentTime !== prevState.playerState?.currentTime) {
      usePlayerStore.getState().saveProgress();
    }

    usePlayerStore.getState().keepAlive();
  }
});
function parseTime(t: string): number {
  if (t === "") {
    return 0;
  }
  if (t.endsWith("s")) {
    return Number(t.slice(0, -1));
  }
  return Number(t.split(":").reduce((acc, time) => 60 * acc + Number(time), 0));
}
