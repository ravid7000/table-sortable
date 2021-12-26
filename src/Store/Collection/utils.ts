import get from 'lodash.get'

import { SORT_ORDER } from '../../enums'
import type { Collection } from '../../options'

export const sortData = (data: Collection, key: string, order: SORT_ORDER) => {
  if (order === null) {
    return data
  }

  return data.sort((a, b) => {
    const aVal = a[key] || get(a, key)
    const bVal = b[key] || get(b, key)

    if (aVal === bVal) {
      return 0
    }

    if (order === SORT_ORDER.ASC) {
      return aVal < bVal ? -1 : 1
    }

    return aVal > bVal ? -1 : 1
  })
}
