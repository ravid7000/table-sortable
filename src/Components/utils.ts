import isArray from 'lodash.isarray'

import type { Collection, PartialOptions } from 'options'

import { ColumnAlignment } from 'enums'

export const isColumnSortable = (
  columnIdx: number,
  options: PartialOptions,
  colSorting: boolean
) => {
  if (colSorting === false || !options.sorting) {
    return false
  }

  return (
    options.sorting === true ||
    (isArray(options.sorting) && options.sorting.indexOf(columnIdx) > -1)
  )
}

export const orderedColumns = (columns: PartialOptions['columns']) => {
  return isArray(columns)
    ? columns.map((col) => ({
        dataKey: col.dataKey,
        type: col.type || 'text',
      }))
    : []
}

export const columnAlign = (columnType: string) => {
  return ColumnAlignment[columnType]
}

export const paginatedData = (
  data: Collection,
  options: PartialOptions,
  currentPage = 0
) => {
  const rowsPerPage = options.rowsPerPage || 10
  const min = currentPage * rowsPerPage
  const max = min + rowsPerPage
  return {
    totalPages: options.totalPages || data.length / rowsPerPage,
    currentPage,
    data: data.slice(min, max),
  }
}

export const createPagination = ({
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
