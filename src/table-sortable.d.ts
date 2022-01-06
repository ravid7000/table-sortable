/**
 * output only
 */
declare module 'table-sortable' {
  import type { Collection, PartialOptions } from './options'
  class TableSortable {
    constructor(parentNode: HTMLElement, options: PartialOptions)
    /**
     * Set runtime data to Table
     * @param data
     * @param update
     */
    setData(data: Collection, update?: boolean): void
    /**
     * Set runtime options to Table
     * @param options
     * @param update
     */
    setOptions(options: PartialOptions, update?: boolean): void
    /**
     * Set current page
     */
    setPage(page: number): void
    /**
     * Get table data.
     */
    getData(): void
    /**
     * Get data for current page
     */
    getCurrentPageData(): void
  }
  export default TableSortable
}
