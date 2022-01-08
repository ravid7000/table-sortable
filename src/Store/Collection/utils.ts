import get from 'lodash.get'

import { SORT_ORDER, UNIQUE_ID_KEY } from '../../enums'
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

export const matchString = (str1: unknown, str2: string) => {
  if (typeof str1 !== 'string') {
    return false
  }

  if (typeof str1 === 'number') {
    return String(str1).indexOf(str2) !== -1
  }

  return str1.toLowerCase().indexOf(str2.toLowerCase()) !== -1
}

export const createUniqueId = (prefix: string | number) =>
  `${prefix}_${Math.random().toString(16).slice(8)}`

export const addUniqueIdInData = (data: Collection, baseIndex = 0) => {
  return data.map((item, index) => ({
    ...item,
    [UNIQUE_ID_KEY]: createUniqueId(baseIndex + index),
  }))
}
