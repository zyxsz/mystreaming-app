import { create } from "zustand";
import type { Cue } from "./types";

export type PlayerTextStore = {
  cues: Cue[];
  isVisible: boolean;
  selectedLanguage: string | null;
  remove: (startTime: number, endTime: number) => void;
  append: (cues: Cue[]) => void;
  getChunk: (time: number) => any;
};

export const playerTextStore = create<PlayerTextStore>((set, get) => ({
  cues: [],
  isVisible: false,
  selectedLanguage: null,
  remove(startTime, endTime) {
    set((state) => ({
      cues: state.cues.filter(
        (cue) => !(cue.startTime >= startTime && cue.endTime <= endTime)
      ),
    }));
  },
  append(cues) {
    set((state) => ({ cues: [...state.cues, ...cues] }));
  },
  getChunk(time) {
    const cues = get().cues;

    const finalCues: Cue[] = [];

    const firstCue = cues.filter(
      (cue) => time > cue.startTime && time < cue.endTime
    )[0];

    if (!firstCue) return null;

    nesteCues(firstCue, time, finalCues);

    return finalCues;
  },
}));

const nesteCues = (cue: Cue, time: number, list: Cue[]) => {
  if (cue.nestedCues.length > 0) {
    cue.nestedCues
      .filter((cue) => time > cue.startTime && time < cue.endTime)
      .map((c) => nesteCues(c, time, list));

    return;
  }

  list.push(cue);
};

playerTextStore.subscribe((state) => {
  console.log("Player text store state update", state);
});
