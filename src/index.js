import $ from 'jquery'
import TableSortable from './TableSortable'
import { data, columns } from './data'

function init() {
    const table = new TableSortable({
        element: '#root',
        searchField: '#searchInput',
        data,
        columns,
        responsive: {
            1100: {
                columns: {
                    formCode: 'Form Code',
                    formName: 'Form Name',
                },
            },
        },
        rowsPerPage: 5,
        pagination: true,
        onPaginationChange: function(nextPage) {
            this.setPage(nextPage)
        },
    })

    $('#searchInput').on('input', function() {
        table.lookUp($(this).val())
    })

    $('#setPage').on('click', function() {
        table.setPage(2)
    })
}

init()
