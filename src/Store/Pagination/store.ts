import cloneDeep from 'lodash.clonedeep'
import memo from 'lodash.memoize'

import { Readable, derived, writable } from 'svelte/store'

import type { Collection } from '../../options'
import { CollectionStore } from '../Collection/store'
import { Options } from '../Options/store'

export type PaginationType = {
  rowsPerPage: number
  currentPage: number
  totalPages: number
  paginationWindow: number
  data: Collection
  pages: number[]
}

export type PaginationButtonsType = number[]

const createPages = memo(
  ({
    currentPage,
    totalPages,
    paginationWindow = 5,
  }: {
    currentPage: number
    totalPages: number
    paginationWindow?: number
  }) => {
    let pages = Array(paginationWindow)
      .fill(0)
      .map((_, idx) => idx + 1)

    if (pages.length > totalPages) {
      pages = pages.slice(0, totalPages)
    }

    if (currentPage <= totalPages && currentPage > 0) {
      let left = 0
      let right = Math.min(totalPages, left + paginationWindow)

      if (
        currentPage > paginationWindow / 2 &&
        currentPage < totalPages - paginationWindow / 2
      ) {
        left = currentPage - Math.floor(paginationWindow / 2)
        right = Math.min(totalPages, left + paginationWindow - 1)
      } else if (currentPage > totalPages - paginationWindow / 2) {
        left = totalPages - paginationWindow + 1
        right = totalPages
      }

      let i = Math.max(1, left)
      pages = []
      while (i <= right) {
        pages.push(i)
        i += 1
      }
    }
    return pages
  }
)

export const CurrentPageStore = writable(0)

export const DerivedPaginationStore: Readable<PaginationType> = derived(
  [Options, CollectionStore, CurrentPageStore],
  ([options, collection, currentPage]) => {
    const rowsPerPage = options.rowsPerPage || 10
    const totalPages =
      options.totalPages || Math.floor(collection.length / rowsPerPage)
    const paginationWindow = Math.min(Math.floor(totalPages / 2), 5)
    const min = currentPage * rowsPerPage
    const max = min + rowsPerPage
    const pages = createPages({ currentPage, totalPages, paginationWindow })

    return {
      currentPage,
      rowsPerPage,
      totalPages,
      paginationWindow,
      data: cloneDeep(collection.slice(min, max)),
      pages,
    }
  }
)
