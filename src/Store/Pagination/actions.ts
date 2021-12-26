import cloneDeep from 'lodash.clonedeep'

import { get } from 'svelte/store'

import type { Collection, PartialOptions } from '../../options'
import { Pagination } from './store'

export const setPagination = ({
  data,
  options,
  currentPage = 0,
  paginationWindow = 5,
}: {
  data: Collection
  options: PartialOptions
  currentPage: number
  paginationWindow: number
}) => {
  const rowsPerPage = options.rowsPerPage || 10
  const min = currentPage * rowsPerPage
  const max = min + rowsPerPage

  Pagination.set({
    rowsPerPage,
    totalPages: options.totalPages || data.length / rowsPerPage,
    currentPage,
    paginationWindow,
    data: cloneDeep(data.slice(min, max)),
  })
}

export const setPaginationData = (data: Collection) => {
  const { rowsPerPage, currentPage } = get(Pagination)
  const min = currentPage * rowsPerPage
  const max = min + rowsPerPage
  Pagination.update((pagination) => ({
    ...pagination,
    data: cloneDeep(data.slice(min, max)),
  }))
}

export const getPaginationData = () => get(Pagination).data
