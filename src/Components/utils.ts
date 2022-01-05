import isArray from 'lodash.isarray'
import isEmpty from 'lodash.isempty'
import isObject from 'lodash.isobject'
import keys from 'lodash.keys'
import memoize from 'lodash.memoize'

import type { PartialOptions } from '../options'
import type Options from '../options'

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

export const classNames = (...args: ClassNamesType[]) => {
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
}

export const setColorVarsForStyle = (
  element: HTMLElement,
  colors: Options['colors']
) => {
  if (element && isObject(colors) && !isEmpty(colors)) {
    keys(colors).map((key) => {
      element.style.setProperty(`--color-${key}`, colors[key])
    })
  }
}
