import Column from './column'

export type Collection = Record<string, unknown>[]

export enum SORT_ORDER {
  DEFAULT = 'DEFAULT',
  ASC = 'ASC',
  DESC = 'DESC',
}

export type THEME = 'minimal' | 'bordered' | 'border-less'

type Options = {
  columns: Column[]
  data: Collection

  // SORTING
  sorting: boolean | number[]
  sortingIcons: {
    asc: string
    desc: string
  }

  // PAGINATION
  rowsPerPage: number
  totalPages: number
  pagination: boolean
  nextText: string
  prevText: string

  // STYLES
  className: string
  rowClassName: string

  searchField: string | null

  colors: {
    primary: string
    background: string
    border: string
    text: string
    buttonBg: string
    header: string
    headerBg: string
    headerBorder: string
    footer: string
    footerBg: string
  }

  theme: THEME

  // LOADING: when data is loading
  loading?: boolean
}

export type PartialOptions = Partial<Options>

export default Options
