import type { Title } from "../../title";

export interface SearchTitlesParams {
  query: string;
}

export type SearchTitlesResponse = Title[];
