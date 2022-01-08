import type { Collection } from '../../options'

export type PaginationType = {
  rowsPerPage: number
  currentPage: number
  totalPages: number
  paginationWindow: number
  data: Collection
  pages: number[]
  startIndex: number
  endIndex: number
}
