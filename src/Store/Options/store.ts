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
    primary: '#007bff',
    background: 'transparent',
    border: '#dee2e6',
    text: '#212529',
    buttonBg: '#f1f1f1',
    headerBg: 'transparent',
    footerBg: 'transparent',
    footer: '#212529',
    header: '#212529',
    headerBorder: '#dee2e6',
  },
}

export const Options = writable<PartialOptions>(DefaultOptions)
