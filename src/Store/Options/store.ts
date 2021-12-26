import { writable } from 'svelte/store'

import type { PartialOptions } from '../../options'

export const DefaultOptions = {
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
}

export const Options = writable<PartialOptions>(DefaultOptions)
