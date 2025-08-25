import { playerTextStore } from "./state";
import type { Cue } from "./types";

export class TextDisplay {
  append(cues: Cue[]) {
    playerTextStore.getState().append(cues);
  }
  setTextLanguage(lang: string) {
    playerTextStore.setState({ selectedLanguage: lang });
  }
  remove(startTime: number, endTime: number) {
    playerTextStore.getState().remove(startTime, endTime);

    return true;
  }
  isTextVisible() {
    return playerTextStore.getState().selectedLanguage !== null;
  }
  enableTextDisplayer() {}
  destroy() {
    playerTextStore.setState({ cues: [] });
  }

  setTextVisibility(value: boolean) {
    playerTextStore.setState({ isVisible: value });
  }
}
