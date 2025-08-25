export type Cue = {
  startTime: number;
  endTime: number;
  nestedCues: Cue[];
  textAlign: string;
  wrapLine: boolean;
  isContainer: boolean;
  payload: string;
  opacity: number;
  lineAlign: string;
};
