import type { PartialOptions } from './options'
import TableSortable from './tableSortable'
import { fetchTestData } from './testData/config'

const table = new TableSortable(document.getElementById('app'), {
  loading: true,
})

function createTable(el: HTMLElement, config: PartialOptions) {
  table.setData(config.data)
  table.setOptions(config)
}

fetchTestData().then(({ data, columns }) => {
  createTable(document.getElementById('app'), {
    data,
    columns,
    rowsPerPage: 10,
    theme: 'minimal',
  })
})
