import isArray from 'lodash.isarray'
import memoize from 'lodash.memoize'

import type { PartialOptions } from '../options'

import { ColumnAlignment, ColumnTypes } from '../enums'

import type { ClassNamesType } from '../types'

export const isColumnSortable = memoize(
  (
    columnIdx: number,
    options: PartialOptions,
    colSorting: boolean,
    columnType: keyof typeof ColumnTypes
  ) => {
    if (
      colSorting === false ||
      !options.sorting ||
      columnType === ColumnTypes.checkbox
    ) {
      return false
    }

    return (
      options.sorting === true ||
      (isArray(options.sorting) && options.sorting.indexOf(columnIdx) > -1)
    )
  }
)

export const columnAlign = (columnType: string) => {
  return ColumnAlignment[columnType]
}

export const removeDuplicateFromArray = (arr: any[]) => {
  return arr.filter((item, index) => arr.indexOf(item) === index)
}

export const classNames = memoize((...args: ClassNamesType[]) => {
  let classes = []
  args.forEach((arg) => {
    if (arg) {
      if (typeof arg === 'string') {
        classes.push(arg)
      } else if (Array.isArray(arg)) {
        classes.push(...arg)
      } else if (typeof arg === 'object') {
        Object.keys(arg).forEach((key) => {
          if (arg[key]) {
            classes.push(key)
          }
        })
      }
    }
  })
  return removeDuplicateFromArray(classes).join(' ')
})
