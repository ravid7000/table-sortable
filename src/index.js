import TableSortable from './TableSortable'
import { data, columns } from './data'

function init() {
    new TableSortable({
        element: '#root',
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
        rowsPerPage: 2,
        pagination: true,
        tableWillMount: () => {
            console.log('table will mount')
        },
        tableDidMount: () => {
            console.log('table did mount')
        },
        tableWillUpdate: () => console.log('table will update'),
        tableDidUpdate: () => console.log('table did update'),
        tableWillUnmount: () => console.log('table will unmount'),
        tableDidUnmount: () => console.log('table did unmount'),
    })
}

init()
