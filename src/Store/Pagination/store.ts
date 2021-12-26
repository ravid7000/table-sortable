import cloneDeep from 'lodash.clonedeep'

import { Readable, derived, writable } from 'svelte/store'

import type { Collection } from '../../options'
import { CollectionStore } from '../Collection/store'
import { Options } from '../Options/store'
import { createPages } from './utils'

export type PaginationType = {
  rowsPerPage: number
  currentPage: number
  totalPages: number
  paginationWindow: number
  data: Collection
  pages: number[]
}

export type PaginationButtonsType = number[]

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
