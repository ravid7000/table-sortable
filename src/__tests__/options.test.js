/**
 * Unit tests for src/TableSortable/options.js
 *
 * Covers:
 *  - normalizeOptions defaults
 *  - validation error paths for every option
 *  - integration: rowClassFn and cellRenderers produce correct DOM
 */

import $ from 'jquery'
import { normalizeOptions, defaults } from '../TableSortable/options'
import TableSortable from '../TableSortable'

// ─── normalizeOptions unit tests ──────────────────────────────────────────────

describe('normalizeOptions – defaults', () => {
    test('returns all default keys when called with an empty object', () => {
        const opts = normalizeOptions({})
        expect(opts).toMatchObject(defaults)
    })

    test('merges caller values over defaults', () => {
        const opts = normalizeOptions({ rowsPerPage: 25, stickyHeader: true })
        expect(opts.rowsPerPage).toBe(25)
        expect(opts.stickyHeader).toBe(true)
        // other defaults should remain
        expect(opts.pagination).toBe(true)
        expect(opts.sorting).toBe(true)
    })

    test('new option defaults are present', () => {
        const opts = normalizeOptions({})
        expect(opts.columnWidths).toEqual({})
        expect(opts.rowClassFn).toBeNull()
        expect(opts.cellRenderers).toEqual({})
        expect(opts.headerRenderers).toEqual({})
        expect(opts.stickyHeader).toBe(false)
        expect(opts.noDataTemplate).toBeNull()
        expect(opts.tableClassName).toBe('')
        expect(opts.onRowClick).toBeNull()
    })
})

describe('normalizeOptions – backward compatibility', () => {
    test('existing option keys continue to work unchanged', () => {
        const input = {
            data: [{ a: 1 }],
            columns: { a: 'A' },
            rowsPerPage: 5,
            pagination: false,
            responsive: { 768: { columns: { a: 'A' } } },
        }
        const opts = normalizeOptions(input)
        expect(opts.data).toEqual([{ a: 1 }])
        expect(opts.columns).toEqual({ a: 'A' })
        expect(opts.rowsPerPage).toBe(5)
        expect(opts.pagination).toBe(false)
        expect(opts.responsive).toEqual({ 768: { columns: { a: 'A' } } })
    })
})

describe('normalizeOptions – validation errors', () => {
    test('throws when data is not an array', () => {
        expect(() => normalizeOptions({ data: 'not an array' })).toThrow(/options\.data/)
    })

    test('throws when columns is not an object', () => {
        expect(() => normalizeOptions({ columns: 'bad' })).toThrow(/options\.columns/)
    })

    test('throws when columns is an array', () => {
        expect(() => normalizeOptions({ columns: ['a'] })).toThrow(/options\.columns/)
    })

    test('throws when rowsPerPage is not a positive number', () => {
        expect(() => normalizeOptions({ rowsPerPage: 'ten' })).toThrow(/options\.rowsPerPage/)
        expect(() => normalizeOptions({ rowsPerPage: 0 })).toThrow(/options\.rowsPerPage/)
        expect(() => normalizeOptions({ rowsPerPage: -5 })).toThrow(/options\.rowsPerPage/)
    })

    test('throws when totalPages is not a number', () => {
        expect(() => normalizeOptions({ totalPages: 'many' })).toThrow(/options\.totalPages/)
    })

    test('throws when formatCell is not a function or null', () => {
        expect(() => normalizeOptions({ formatCell: 'string' })).toThrow(/options\.formatCell/)
    })

    test('throws when formatHeader is not a function or null', () => {
        expect(() => normalizeOptions({ formatHeader: 42 })).toThrow(/options\.formatHeader/)
    })

    test('throws when onPaginationChange is not a function or null', () => {
        expect(() => normalizeOptions({ onPaginationChange: {} })).toThrow(/options\.onPaginationChange/)
    })

    test('throws when responsive is not a plain object', () => {
        expect(() => normalizeOptions({ responsive: 'yes' })).toThrow(/options\.responsive/)
        expect(() => normalizeOptions({ responsive: [1, 2] })).toThrow(/options\.responsive/)
    })

    test('throws when sorting is not boolean or array', () => {
        expect(() => normalizeOptions({ sorting: 'all' })).toThrow(/options\.sorting/)
        expect(() => normalizeOptions({ sorting: 42 })).toThrow(/options\.sorting/)
    })

    // ── New options ──────────────────────────────────────────────────────────

    test('throws when columnWidths is not a plain object', () => {
        expect(() => normalizeOptions({ columnWidths: 'wide' })).toThrow(/options\.columnWidths/)
        expect(() => normalizeOptions({ columnWidths: ['100px'] })).toThrow(/options\.columnWidths/)
    })

    test('throws when a columnWidths value is not a string', () => {
        expect(() =>
            normalizeOptions({ columnWidths: { name: 100 } })
        ).toThrow(/options\.columnWidths\.name/)
    })

    test('accepts valid columnWidths', () => {
        const opts = normalizeOptions({ columnWidths: { name: '200px', age: '10%' } })
        expect(opts.columnWidths).toEqual({ name: '200px', age: '10%' })
    })

    test('throws when rowClassFn is not a function or null', () => {
        expect(() => normalizeOptions({ rowClassFn: 'red' })).toThrow(/options\.rowClassFn/)
    })

    test('accepts a valid rowClassFn', () => {
        const fn = () => 'highlight'
        const opts = normalizeOptions({ rowClassFn: fn })
        expect(opts.rowClassFn).toBe(fn)
    })

    test('throws when cellRenderers is not a plain object', () => {
        expect(() => normalizeOptions({ cellRenderers: 'fn' })).toThrow(/options\.cellRenderers/)
    })

    test('throws when a cellRenderers value is not a function', () => {
        expect(() =>
            normalizeOptions({ cellRenderers: { name: '<b>name</b>' } })
        ).toThrow(/options\.cellRenderers\.name/)
    })

    test('accepts valid cellRenderers', () => {
        const renderer = val => `<b>${val}</b>`
        const opts = normalizeOptions({ cellRenderers: { name: renderer } })
        expect(opts.cellRenderers.name).toBe(renderer)
    })

    test('throws when headerRenderers is not a plain object', () => {
        expect(() => normalizeOptions({ headerRenderers: 42 })).toThrow(/options\.headerRenderers/)
    })

    test('throws when a headerRenderers value is not a function', () => {
        expect(() =>
            normalizeOptions({ headerRenderers: { name: 'Name' } })
        ).toThrow(/options\.headerRenderers\.name/)
    })

    test('accepts valid headerRenderers', () => {
        const renderer = label => `<em>${label}</em>`
        const opts = normalizeOptions({ headerRenderers: { name: renderer } })
        expect(opts.headerRenderers.name).toBe(renderer)
    })

    test('throws when stickyHeader is not boolean', () => {
        expect(() => normalizeOptions({ stickyHeader: 'yes' })).toThrow(/options\.stickyHeader/)
        expect(() => normalizeOptions({ stickyHeader: 1 })).toThrow(/options\.stickyHeader/)
    })

    test('accepts stickyHeader: true', () => {
        const opts = normalizeOptions({ stickyHeader: true })
        expect(opts.stickyHeader).toBe(true)
    })

    test('throws when noDataTemplate is an invalid type', () => {
        expect(() => normalizeOptions({ noDataTemplate: 42 })).toThrow(/options\.noDataTemplate/)
        expect(() => normalizeOptions({ noDataTemplate: {} })).toThrow(/options\.noDataTemplate/)
    })

    test('accepts noDataTemplate as string', () => {
        const opts = normalizeOptions({ noDataTemplate: '<p>Empty</p>' })
        expect(opts.noDataTemplate).toBe('<p>Empty</p>')
    })

    test('accepts noDataTemplate as function', () => {
        const fn = () => '<p>No rows</p>'
        const opts = normalizeOptions({ noDataTemplate: fn })
        expect(opts.noDataTemplate).toBe(fn)
    })

    test('throws when tableClassName is not a string', () => {
        expect(() => normalizeOptions({ tableClassName: 123 })).toThrow(/options\.tableClassName/)
    })

    test('accepts a valid tableClassName', () => {
        const opts = normalizeOptions({ tableClassName: 'my-table compact' })
        expect(opts.tableClassName).toBe('my-table compact')
    })

    test('throws when onRowClick is not a function or null', () => {
        expect(() => normalizeOptions({ onRowClick: 'click' })).toThrow(/options\.onRowClick/)
    })

    test('accepts a valid onRowClick function', () => {
        const fn = jest.fn()
        const opts = normalizeOptions({ onRowClick: fn })
        expect(opts.onRowClick).toBe(fn)
    })

    test('accepts null for all nullable options', () => {
        const opts = normalizeOptions({
            formatCell: null,
            formatHeader: null,
            onPaginationChange: null,
            rowClassFn: null,
            noDataTemplate: null,
            onRowClick: null,
        })
        expect(opts.formatCell).toBeNull()
        expect(opts.formatHeader).toBeNull()
        expect(opts.onPaginationChange).toBeNull()
        expect(opts.rowClassFn).toBeNull()
        expect(opts.noDataTemplate).toBeNull()
        expect(opts.onRowClick).toBeNull()
    })
})

// ─── Integration tests ────────────────────────────────────────────────────────

const rootElm = '#integration-root'

const sampleData = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Carol', age: 35 },
]

const sampleColumns = {
    id: 'ID',
    name: 'Name',
    age: 'Age',
}

beforeAll(() => {
    document.body.innerHTML = `<div id="integration-root"></div>`
})

beforeEach(() => {
    document.body.innerHTML = `<div id="integration-root"></div>`
})

describe('Integration – rowClassFn', () => {
    test('applies the class returned by rowClassFn to each <tr>', () => {
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            rowClassFn: (rowData, rowIndex) => (rowIndex % 2 === 0 ? 'even-row' : 'odd-row'),
        })

        const rows = $(rootElm).find('tbody tr')
        expect(rows.length).toBe(3)
        expect($(rows[0]).hasClass('even-row')).toBe(true)
        expect($(rows[1]).hasClass('odd-row')).toBe(true)
        expect($(rows[2]).hasClass('even-row')).toBe(true)
    })

    test('rowClassFn receives the correct rowData', () => {
        const capturedData = []
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            rowClassFn: (rowData) => {
                capturedData.push(rowData)
                return ''
            },
        })

        expect(capturedData).toHaveLength(3)
        expect(capturedData[0]).toEqual(sampleData[0])
        expect(capturedData[1]).toEqual(sampleData[1])
        expect(capturedData[2]).toEqual(sampleData[2])
    })
})

describe('Integration – cellRenderers', () => {
    test('custom cellRenderer output appears in the DOM', () => {
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            cellRenderers: {
                name: (value) => `<strong class="custom-name">${value}</strong>`,
            },
        })

        const customCells = $(rootElm).find('tbody .custom-name')
        expect(customCells.length).toBe(3)
        expect($(customCells[0]).text()).toBe('Alice')
        expect($(customCells[1]).text()).toBe('Bob')
        expect($(customCells[2]).text()).toBe('Carol')
    })

    test('cellRenderer receives value and rowData', () => {
        const calls = []
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            cellRenderers: {
                age: (value, rowData) => {
                    calls.push({ value, rowData })
                    return String(value)
                },
            },
        })

        expect(calls).toHaveLength(3)
        expect(calls[0].value).toBe(30)
        expect(calls[0].rowData).toEqual(sampleData[0])
    })

    test('non-rendered columns fall back to default rendering', () => {
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            cellRenderers: {
                name: (value) => `<em>${value}</em>`,
            },
        })

        // id and age should still render their raw values
        const rows = $(rootElm).find('tbody tr')
        const firstRowCells = $(rows[0]).find('td')
        // id column (index 0) should just show 1
        expect($(firstRowCells[0]).text()).toBe('1')
        // age column (index 2) should show 30
        expect($(firstRowCells[2]).text()).toBe('30')
    })
})

describe('Integration – headerRenderers', () => {
    test('custom headerRenderer output appears in the <thead>', () => {
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            headerRenderers: {
                name: (label) => `<span class="custom-header">${label.toUpperCase()}</span>`,
            },
        })

        const customHeaders = $(rootElm).find('thead .custom-header')
        expect(customHeaders.length).toBe(1)
        expect(customHeaders.text()).toBe('NAME')
    })
})

describe('Integration – tableClassName', () => {
    test('extra class is applied to the root <table>', () => {
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            tableClassName: 'my-custom-table',
        })

        const table = $(rootElm).find('table')
        expect(table.hasClass('my-custom-table')).toBe(true)
        // original classes should still be present
        expect(table.hasClass('gs-table')).toBe(true)
    })
})

describe('Integration – stickyHeader', () => {
    test('gs-sticky-header class is added to thead when stickyHeader is true', () => {
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            stickyHeader: true,
        })

        const thead = $(rootElm).find('thead')
        expect(thead.hasClass('gs-sticky-header')).toBe(true)
    })

    test('gs-sticky-header class is NOT present when stickyHeader is false', () => {
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            stickyHeader: false,
        })

        const thead = $(rootElm).find('thead')
        expect(thead.hasClass('gs-sticky-header')).toBe(false)
    })
})

describe('Integration – noDataTemplate', () => {
    test('renders default empty-state message when data is empty', () => {
        new TableSortable({
            element: rootElm,
            data: [],
            columns: sampleColumns,
            pagination: false,
        })

        const noDataCell = $(rootElm).find('.gs-no-data')
        expect(noDataCell.length).toBe(1)
    })

    test('renders string noDataTemplate', () => {
        new TableSortable({
            element: rootElm,
            data: [],
            columns: sampleColumns,
            pagination: false,
            noDataTemplate: '<p class="empty">Nothing here!</p>',
        })

        expect($(rootElm).find('.empty').length).toBe(1)
        expect($(rootElm).find('.empty').text()).toBe('Nothing here!')
    })

    test('renders function noDataTemplate', () => {
        new TableSortable({
            element: rootElm,
            data: [],
            columns: sampleColumns,
            pagination: false,
            noDataTemplate: () => '<span class="fn-empty">Generated</span>',
        })

        expect($(rootElm).find('.fn-empty').length).toBe(1)
        expect($(rootElm).find('.fn-empty').text()).toBe('Generated')
    })
})

describe('Integration – onRowClick', () => {
    test('onRowClick is called when a row is clicked', () => {
        const onClick = jest.fn()
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            onRowClick: onClick,
        })

        const firstRow = $(rootElm).find('tbody tr').first()
        firstRow.click()
        expect(onClick).toHaveBeenCalledTimes(1)
        const [rowData, rowIndex] = onClick.mock.calls[0]
        expect(rowData).toEqual(sampleData[0])
        expect(rowIndex).toBe(0)
    })
})

describe('Integration – columnWidths', () => {
    test('colgroup with col elements is rendered when columnWidths are set', () => {
        new TableSortable({
            element: rootElm,
            data: sampleData,
            columns: sampleColumns,
            pagination: false,
            columnWidths: { id: '50px', name: '200px' },
        })

        const colgroup = $(rootElm).find('colgroup')
        expect(colgroup.length).toBe(1)
        const cols = colgroup.find('col')
        expect(cols.length).toBe(3) // one per column
    })
})
