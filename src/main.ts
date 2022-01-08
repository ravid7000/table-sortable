import type { PartialOptions } from './options'
import TableSortable from './tableSortable'
import { fetchTestData } from './testData/config'

const table = new TableSortable(document.getElementById('app'), {
  loading: true,
})

function createTable(el: HTMLElement, config: PartialOptions) {
  table.setData(config.data)
  table.setOptions(config)

  const select = document.getElementById('changeRows')
  select.addEventListener('change', () => {
    const rowsPerPage = select.value
    table.setRowsPerPage(rowsPerPage)
  })

  const search = document.getElementById('searchField')
  search.addEventListener('keyup', (e: any) => {
    const search = e.target.value
    table.search(search)
  })

  console.log(table.getData())
}

fetchTestData().then(({ data, columns }) => {
  createTable(document.getElementById('app'), {
    data,
    columns,
    rowsPerPage: 10,
    theme: 'minimal',
  })
})
