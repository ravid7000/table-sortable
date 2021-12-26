import App from 'App.svelte'
// utils
import cloneDeep from 'lodash.clonedeep'

import { setCollection } from 'Store/Collection/actions'
import { setOptions } from 'Store/Options/actions'
import { setPagination } from 'Store/Pagination/actions'
import { isOptionsValid } from 'Store/validators'

import type { Collection, PartialOptions } from 'options'

import { fetchTestData } from './testData/config'

class TableSortable {
  private app!: App

  constructor(
    private parentNode: HTMLElement,
    private options: PartialOptions
  ) {
    if (!isOptionsValid(this.options)) {
      throw Error(
        'TableSortable options are not valid. Please see the docs for valid options.'
      )
    }

    setCollection(cloneDeep(options.data))
    setOptions({ ...options, data: [] })
    setPagination({
      data: this.options.data,
      options: this.options,
      currentPage: 0,
      paginationWindow: 5,
    })
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
    this.app.setData(data, update)
  }

  /**
   * Set runtime options to Table
   * @param options
   * @param update
   */
  setOptions(options: PartialOptions, update?: boolean) {
    this.app.setOptions(options, update)
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
}

const table = new TableSortable(document.body, {})

function createTable(el: HTMLElement, config: PartialOptions) {
  table.setData(config.data)
  table.setOptions(config)
}

fetchTestData().then(({ data, columns }) => {
  createTable(document.body, {
    data,
    columns,
    rowsPerPage: 5,
  })
})

export default table
