/**
 * Integration smoke tests for infinite-scroll / virtualization mode.
 */
import $ from 'jquery'
import TableSortable from '..'
import { data, columns } from '../__mock__/data'

const rootElm = '#root'

beforeEach(() => {
    document.body.innerHTML = `<div id="root"></div>`
})

// ── Helper ──────────────────────────────────────────────────────────────────

function makeTable(extraOpts = {}) {
    return new TableSortable({
        element: rootElm,
        data,
        columns,
        paginationMode: 'infinite-scroll',
        rowHeight: 40,
        overscan: 2,
        ...extraOpts,
    })
}

// ── paginationMode: 'paginated' leaves pagination intact ────────────────────

describe('paginationMode: paginated (default)', () => {
    test('pagination buttons are rendered when paginationMode is paginated', () => {
        new TableSortable({
            element: rootElm,
            data,
            columns,
            paginationMode: 'paginated',
        })
        expect($(rootElm).find('.gs-pagination').length).toBe(1)
        expect($(rootElm).find('.gs-pagination button').length).toBeGreaterThan(0)
    })

    test('default paginationMode behaves like paginated', () => {
        new TableSortable({
            element: rootElm,
            data,
            columns,
        })
        expect($(rootElm).find('.gs-pagination').length).toBe(1)
    })
})

// ── paginationMode: 'infinite-scroll' ───────────────────────────────────────

describe('paginationMode: infinite-scroll', () => {
    test('table mounts without errors', () => {
        const table = makeTable()
        expect(table._isMounted).toBe(true)
        expect($(rootElm).find('table').length).toBe(1)
    })

    test('pagination buttons are hidden / not rendered', () => {
        makeTable()
        // Pagination element should either not exist or be hidden
        const paginationElm = $(rootElm).find('.gs-pagination')
        if (paginationElm.length) {
            expect(paginationElm.is(':visible')).toBe(false)
        } else {
            expect(paginationElm.length).toBe(0)
        }
    })

    test('VirtualizationEngine is attached on init', () => {
        const table = makeTable()
        expect(table._virtualization).not.toBeNull()
    })

    test('VirtualizationEngine is detached on destroy', () => {
        const table = makeTable()
        expect(table._virtualization).not.toBeNull()
        table.distroy()
        expect(table._virtualization).toBeNull()
    })

    test('all data rows are rendered (no pagination slicing)', () => {
        const table = makeTable()
        // In infinite-scroll mode we show all rows at once before windowing
        // The virtualization engine then replaces some with spacers.
        // The tbody should contain at least some <tr> elements.
        const trCount = $(rootElm).find('tbody tr').length
        expect(trCount).toBeGreaterThan(0)
    })

    test('spacer <tr> elements are inserted after virtualization update', () => {
        const table = makeTable({ overscan: 0, rowHeight: 40 })
        // Manually trigger window application with a small viewport
        if (table._virtualization) {
            // Simulate small viewport: only rows 0-2 visible
            table._virtualization._allRows = $(rootElm)
                .find('tbody tr')
                .toArray()
                .map(el => $(el).clone(true))
            table._virtualization._startIndex = -1 // force re-render
            table._virtualization._endIndex = -1
            table._virtualization._patchTbody(2, 5)
        }
        const spacers = $(rootElm).find('tbody tr.gs-virtual-spacer')
        expect(spacers.length).toBeGreaterThanOrEqual(1)
    })

    test('spacer has correct height attribute', () => {
        const rowHeight = 40
        const table = makeTable({ rowHeight, overscan: 0 })
        if (table._virtualization) {
            table._virtualization._allRows = $(rootElm)
                .find('tbody tr')
                .toArray()
                .map(el => $(el).clone(true))
            table._virtualization._startIndex = -1
            table._virtualization._endIndex = -1
            // Show rows 3-7, so 3 rows above (spacer = 3 × 40 = 120 px)
            table._virtualization._patchTbody(3, 7)
        }
        const topSpacer = $(rootElm).find('tbody tr.gs-virtual-spacer').first()
        expect(topSpacer.length).toBe(1)
        // The td inside should have data-virtualization-spacer
        const td = topSpacer.find('td')
        expect(parseInt(td.attr('data-virtualization-spacer'), 10)).toBe(3)
    })

    test('onLoadMore is called when scroll threshold is reached', () => {
        const onLoadMore = jest.fn()
        const table = makeTable({ onLoadMore, scrollThreshold: 200 })

        expect(table._virtualization).not.toBeNull()

        // Simulate being near the bottom: scrollHeight - scrollTop - clientHeight <= threshold
        const container = $(rootElm).find('.gs-table-container')[0] || $(rootElm)[0]
        Object.defineProperty(container, 'scrollHeight', { value: 1000, configurable: true })
        Object.defineProperty(container, 'scrollTop', { value: 850, configurable: true })
        Object.defineProperty(container, 'clientHeight', { value: 100, configurable: true })
        // distanceFromBottom = 1000 - 850 - 100 = 50 ≤ 200

        table._virtualization._checkLoadMore()
        expect(onLoadMore).toHaveBeenCalledTimes(1)
        expect(onLoadMore).toHaveBeenCalledWith(0, data.length)
    })

    test('onLoadMore is NOT called when far from bottom', () => {
        const onLoadMore = jest.fn()
        const table = makeTable({ onLoadMore, scrollThreshold: 200 })

        const container = $(rootElm).find('.gs-table-container')[0] || $(rootElm)[0]
        Object.defineProperty(container, 'scrollHeight', { value: 2000, configurable: true })
        Object.defineProperty(container, 'scrollTop', { value: 0, configurable: true })
        Object.defineProperty(container, 'clientHeight', { value: 300, configurable: true })
        // distanceFromBottom = 2000 - 0 - 300 = 1700 > 200

        table._virtualization._checkLoadMore()
        expect(onLoadMore).not.toHaveBeenCalled()
    })

    test('onLoadMore receives correct currentPage and rowsLoaded', () => {
        const onLoadMore = jest.fn()
        const table = makeTable({ onLoadMore, scrollThreshold: 9999 })

        const engine = table._virtualization
        engine._currentPage = 2
        engine._totalRows = 55

        // Force near-bottom
        const container = $(rootElm).find('.gs-table-container')[0] || $(rootElm)[0]
        Object.defineProperty(container, 'scrollHeight', { value: 500, configurable: true })
        Object.defineProperty(container, 'scrollTop', { value: 400, configurable: true })
        Object.defineProperty(container, 'clientHeight', { value: 50, configurable: true })

        engine._checkLoadMore()
        expect(onLoadMore).toHaveBeenCalledWith(2, 55)
    })

    test('onLoadMore promise response appends rows and re-renders', done => {
        const extraRows = [
            {
                formCode: 99999,
                formName: 'Extra Form',
                fullName: 'Extra User',
                appointmentDate: '1 Jan, 2024',
                appointmentTime: '9:00AM',
                phone: '0000000000',
            },
        ]
        const onLoadMore = jest.fn().mockResolvedValue(extraRows)
        const table = makeTable({ onLoadMore, scrollThreshold: 9999 })

        const initialLen = table._dataset._datasetLen

        // Trigger near-bottom
        const container = $(rootElm).find('.gs-table-container')[0] || $(rootElm)[0]
        Object.defineProperty(container, 'scrollHeight', { value: 500, configurable: true })
        Object.defineProperty(container, 'scrollTop', { value: 400, configurable: true })
        Object.defineProperty(container, 'clientHeight', { value: 50, configurable: true })

        table._virtualization._checkLoadMore()

        // Let the promise resolve
        Promise.resolve().then(() => Promise.resolve()).then(() => {
            expect(table._dataset._datasetLen).toBe(initialLen + extraRows.length)
            done()
        })
    })
})
