import { Writable, derived, writable } from 'svelte/store'

import type { Collection } from '../../options'

export type PaginationType = {
  rowsPerPage: number
  currentPage: number
  totalPages: number
  paginationWindow: number
  data: Collection
}

export type PaginationButtonsType = number[]

export const Pagination = writable<PaginationType>({
  rowsPerPage: 10,
  currentPage: 0,
  totalPages: 0,
  paginationWindow: 5,
  data: [],
})

export const PaginationButtons = derived<
  Writable<PaginationType>,
  PaginationButtonsType
>(Pagination, ($pagination) => {
  const { currentPage, totalPages, paginationWindow } = $pagination
  const minPage = Math.max(0, currentPage - paginationWindow)
  const maxPage = Math.min(totalPages, currentPage + paginationWindow)
  const pages = []
  for (let i = minPage; i < maxPage; i++) {
    pages.push(i)
  }
  return pages
})
