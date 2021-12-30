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
  colors: {
    primary: '#0070f3',
    background: '#f5f5f5',
    border: '#e1e1e1',
    text: '#333',
  },
}

export const Options = writable<PartialOptions>(DefaultOptions)
