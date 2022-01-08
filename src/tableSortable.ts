import cloneDeep from 'lodash.clonedeep'

import App from './App.svelte'

import { setCollection } from './Store/Collection/actions'
import { setOptions } from './Store/Options/actions'
import {
  isCollectionValid,
  isDataLoading,
  isOptionsValid,
} from './Store/validators'

import type { Collection, PartialOptions } from './options'

class TableSortable {
  private app!: App

  constructor(
    private parentNode: HTMLElement,
    private options: PartialOptions
  ) {
    if (!isDataLoading(this.options)) {
      if (!isOptionsValid(this.options)) {
        throw Error(
          'TableSortable options are not valid. Please see the docs for valid options.'
        )
      }

      setCollection(cloneDeep(options.data))
      setOptions({ ...options, data: [] })
    }
    this.createApp()
  }

  private createApp() {
    this.app = new App({
      target: this.parentNode,
    })
  }

  /**
   * Set runtime data to Table
   * @param data
   * @param update
   */
  setData(data: Collection, update?: boolean) {
    if (!isCollectionValid(data)) {
      throw new TypeError('TableSortable data is not valid.')
    }
    this.app.setData(data, update)
  }

  /**
   * Set runtime options to Table
   * @param options
   * @param update
   */
  setOptions(options: PartialOptions, update?: boolean) {
    if (!isOptionsValid(options)) {
      throw Error(
        'TableSortable options are not valid. Please see the docs for valid options.'
      )
    }
    this.app.setOptions(options, update)
  }

  /**
   * Set current page
   */
  setPage(page: number) {
    this.app.setPage(page)
  }

  /**
   * Get table data.
   */
  getData() {
    this.app.getData()
  }

  /**
   * Get data for current page
   */
  getCurrentPageData() {
    this.app.getCurrentPageData()
  }

  /**
   * Update rows per page
   * @param rowsPerPage
   */
  setRowsPerPage(rowsPerPage: number) {
    this.app.setRowsPerPage(rowsPerPage)
  }
}

export default TableSortable
