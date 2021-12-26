import isArray from 'lodash.isarray'
import isEmpty from 'lodash.isempty'
import isObject from 'lodash.isobject'

import type { Collection, PartialOptions } from '../options'

import type Column from '../column'

/**
 * Validate the collection should be 1D array.
 * @param data Collection
 * @returns boolean
 */
export function isCollectionValid(data: Collection | undefined | null) {
  return data && isArray(data)
}

export function isColumnsValid(columns: Column[] | undefined | null) {
  return (
    columns && !isEmpty(columns) && isArray(columns) && isObject(columns[0])
  )
}

/**
 * Validate options should be an object and contains required fields. like column and data
 * @param options Options
 * @returns boolean
 */
export function isOptionsValid(options: PartialOptions | undefined | null) {
  if (options === undefined || options === null || isEmpty(options)) {
    return false
  }
  return (
    isObject(options) &&
    isColumnsValid(options.columns) &&
    isCollectionValid(options.data)
  )
}

/**
 * Check if loading option is passed to config.
 * @param options Options
 * @returns
 */
export function isDataLoading(options: PartialOptions | undefined | null) {
  return isObject(options) && options.loading
}
