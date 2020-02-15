import $ from 'jquery'
import TableSortable from '..'

const rootElm = '#root'

beforeAll(() => {
    document.body.innerHTML = `
        <div id="root"></div>
    `
})
describe('Table Sortable Options:', () => {
    test('should be mounted without breaking', () => {
        const table = new TableSortable({
            element: rootElm,
        })
        expect(table._isMounted).toStrictEqual(true)
        expect($(rootElm).find('table').length).toStrictEqual(1)
    })
    test('should create options from default options', () => {
        const table = new TableSortable({
            element: rootElm,
        })
        expect(table.options).toMatchObject({
            element: rootElm,
            data: [],
            columns: {},
            sorting: true,
            pagination: true,
            paginationContainer: null,
            rowsPerPage: 10,
            formatCell: null,
            formatHeader: null,
            searchField: null,
            responsive: {},
            totalPages: 0,
            sortingIcons: {
                asc: '<span>▼</span>',
                desc: '<span>▲</span>',
            },
            nextText: '<span>Next</span>',
            prevText: '<span>Prev</span>',
            onPaginationChange: null,
        })
    })
    test('lifeCycle should call tableWillMount', () => {
        const tableWillMount = jest.fn()
        const table = new TableSortable({
            element: rootElm,
            tableWillMount,
        })
        expect(table.options.tableWillMount).toHaveBeenCalledTimes(1)
    })
    test('lifeCycle should call tableDidMount', () => {
        const tableDidMount = jest.fn()
        const table = new TableSortable({
            element: rootElm,
            tableDidMount,
        })
        expect(table.options.tableDidMount).toHaveBeenCalledTimes(1)
    })
    test('lifeCycle should call tableWillUpdate', () => {
        const tableWillUpdate = jest.fn()
        const table = new TableSortable({
            element: rootElm,
            tableWillUpdate,
        })
        table.refresh()
        expect(table.options.tableWillUpdate).toHaveBeenCalledTimes(1)
    })
    test('lifeCycle should call tableDidUpdate', () => {
        const tableDidUpdate = jest.fn()
        const table = new TableSortable({
            element: rootElm,
            tableDidUpdate,
        })
        table.refresh()
        expect(table.options.tableDidUpdate).toHaveBeenCalledTimes(1)
    })
    test('lifeCycle should call tableWillUnmount', () => {
        const tableWillUnmount = jest.fn()
        const table = new TableSortable({
            element: rootElm,
            tableWillUnmount,
        })
        table.distroy()
        expect(table.options.tableWillUnmount).toHaveBeenCalledTimes(1)
    })
    test('lifeCycle should call tableDidUnmount', () => {
        const tableDidUnmount = jest.fn()
        const table = new TableSortable({
            element: rootElm,
            tableDidUnmount,
        })
        table.distroy()
        expect(table.options.tableDidUnmount).toHaveBeenCalledTimes(1)
    })
})
