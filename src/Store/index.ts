import { writable } from "svelte/store";
import type { Collection, PartialOptions } from "../options";

export const collection = writable<Collection>([]);

export const options = writable<PartialOptions>({
  columns: [],
  sorting: true,
  sortingIcons: {
    asc: '↓',
    desc: '↑',
  },
  rowsPerPage: 10,
  totalPages: 0,
  pagination: true,
  nextText: 'Next',
  prevText: 'Prev',
  className: '',
  rowClassName: '',
  searchField: null,
});