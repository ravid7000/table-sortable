import TableSortable from './TableSortable'
import { data, columns } from './data'

function init() {
    const table = new TableSortable({
        element: 'body',
        data,
        columns,
        rowsPerPage: 2,
    })
    console.log(table)
}

init()
