import memoize from 'lodash.memoize'

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
