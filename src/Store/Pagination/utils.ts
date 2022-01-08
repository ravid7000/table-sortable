import cloneDeep from 'lodash.clonedeep'
import memoize from 'lodash.memoize'

import type { Collection } from '../../options'
import type Options from '../../options'
import type { PaginationType } from './types'

export const createPaginationBasis = (
  options: Partial<Options>,
  data: Collection,
  currentPage: number
): PaginationType => {
  const rowsPerPage = options.rowsPerPage || 10
  const props: PaginationType = {
    rowsPerPage,
    currentPage,
    totalPages: options.totalPages || Math.ceil(data.length / rowsPerPage),
    paginationWindow: 5,
    data: [],
    pages: [],
    startIndex: 0,
    endIndex: 0,
  }

  if (!options.pagination) {
    return { ...props, data }
  }

  props.paginationWindow = Math.min(Math.ceil(props.totalPages / 2), 5)
  props.startIndex = currentPage * rowsPerPage
  props.endIndex = props.startIndex + rowsPerPage
  props.pages = createPages({
    currentPage,
    totalPages: props.totalPages,
    paginationWindow: props.paginationWindow,
  })
  props.data = cloneDeep(data.slice(props.startIndex, props.endIndex))

  return props
}

export const createPages = memoize(
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
