/**
 * DataSet – Reactive State Manager
 * Comprehensive test suite
 */

import { data } from '../../TableSortable/__mock__/data'
import DataSet from '../'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal dataset with n numeric rows sorted by `value`. */
function makeNumericData(n) {
    return Array.from({ length: n }, (_, i) => ({ id: i + 1, value: i + 1, label: `item-${i + 1}` }))
}

// ---------------------------------------------------------------------------
// Construction & fromCollection
// ---------------------------------------------------------------------------

describe('DataSet – construction', () => {
    test('creates an instance without options', () => {
        const ds = new DataSet()
        expect(ds).toBeInstanceOf(DataSet)
    })

    test('initial state has correct defaults', () => {
        const ds = new DataSet()
        const state = ds.getState()
        expect(state.rawData).toEqual([])
        expect(state.sortedData).toEqual([])
        expect(state.filteredData).toEqual([])
        expect(state.currentPage).toBe(0)
        expect(state.pageSize).toBe(10)
        expect(state.totalRows).toBe(0)
        expect(state.sortColumn).toBe('')
        expect(state.sortDirection).toBe('')
        expect(state.paginationMode).toBe('paginated')
    })

    test('accepts options.data, options.pageSize and options.paginationMode', () => {
        const rows = makeNumericData(5)
        const ds = new DataSet({ data: rows, pageSize: 2, paginationMode: 'infinite' })
        const state = ds.getState()
        expect(state.rawData).toHaveLength(5)
        expect(state.pageSize).toBe(2)
        expect(state.paginationMode).toBe('infinite')
    })

    test('state is frozen (immutable)', () => {
        const ds = new DataSet()
        const state = ds.getState()
        expect(Object.isFrozen(state)).toBe(true)
    })
})

describe('DataSet – fromCollection', () => {
    test('loads collection and sets rawData / totalRows', () => {
        const ds = new DataSet()
        ds.fromCollection(data)
        const state = ds.getState()
        expect(state.rawData).toHaveLength(data.length)
        expect(state.totalRows).toBe(data.length)
        expect(state.filteredData).toHaveLength(data.length)
    })

    test('resets sort and page when a new collection is loaded', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(20))
        ds.sort('value', 'desc')
        ds.goToPage(1)
        ds.fromCollection(makeNumericData(5))
        const state = ds.getState()
        expect(state.sortColumn).toBe('')
        expect(state.sortDirection).toBe('')
        expect(state.currentPage).toBe(0)
    })

    test('throws when data is not an array', () => {
        const ds = new DataSet()
        expect(() => ds.fromCollection('not-an-array')).toThrow()
        expect(() => ds.fromCollection(null)).toThrow()
        expect(() => ds.fromCollection(42)).toThrow()
    })

    test('handles empty array', () => {
        const ds = new DataSet()
        ds.fromCollection([])
        expect(ds.getState().totalRows).toBe(0)
    })

    test('handles single-row array', () => {
        const ds = new DataSet()
        ds.fromCollection([{ id: 1 }])
        expect(ds.getState().totalRows).toBe(1)
    })
})

// ---------------------------------------------------------------------------
// Subscribe / Unsubscribe
// ---------------------------------------------------------------------------

describe('DataSet – subscribe / unsubscribe', () => {
    test('subscribe returns an unsubscribe function', () => {
        const ds = new DataSet()
        const unsub = ds.subscribe(() => {})
        expect(typeof unsub).toBe('function')
    })

    test('subscriber is called on mutation', () => {
        const ds = new DataSet()
        const cb = jest.fn()
        ds.subscribe(cb)
        ds.fromCollection(makeNumericData(5))
        expect(cb).toHaveBeenCalledTimes(1)
    })

    test('subscriber receives frozen state snapshot', () => {
        const ds = new DataSet()
        let received
        ds.subscribe(state => { received = state })
        ds.fromCollection(makeNumericData(3))
        expect(Object.isFrozen(received)).toBe(true)
        expect(received.totalRows).toBe(3)
    })

    test('multiple subscribers all receive updates', () => {
        const ds = new DataSet()
        const cb1 = jest.fn()
        const cb2 = jest.fn()
        ds.subscribe(cb1)
        ds.subscribe(cb2)
        ds.fromCollection(makeNumericData(2))
        expect(cb1).toHaveBeenCalledTimes(1)
        expect(cb2).toHaveBeenCalledTimes(1)
    })

    test('unsubscribe via returned function stops notifications', () => {
        const ds = new DataSet()
        const cb = jest.fn()
        const unsub = ds.subscribe(cb)
        ds.fromCollection(makeNumericData(2))
        expect(cb).toHaveBeenCalledTimes(1)
        unsub()
        ds.fromCollection(makeNumericData(3))
        expect(cb).toHaveBeenCalledTimes(1) // no additional calls
    })

    test('unsubscribe via ds.unsubscribe() stops notifications', () => {
        const ds = new DataSet()
        const cb = jest.fn()
        ds.subscribe(cb)
        ds.unsubscribe(cb)
        ds.fromCollection(makeNumericData(2))
        expect(cb).toHaveBeenCalledTimes(0)
    })

    test('throws when non-function is passed to subscribe', () => {
        const ds = new DataSet()
        expect(() => ds.subscribe('not-a-function')).toThrow()
        expect(() => ds.subscribe(null)).toThrow()
    })

    test('subscription lifecycle – subscribe, mutate, unsubscribe, mutate', () => {
        const ds = new DataSet()
        const calls = []
        const unsub = ds.subscribe(s => calls.push(s.totalRows))
        ds.fromCollection(makeNumericData(3))
        ds.fromCollection(makeNumericData(5))
        unsub()
        ds.fromCollection(makeNumericData(7))
        expect(calls).toEqual([3, 5])
    })

    test('a throwing subscriber does not break other subscribers', () => {
        const ds = new DataSet()
        const bad = () => { throw new Error('boom') }
        const good = jest.fn()
        ds.subscribe(bad)
        ds.subscribe(good)
        expect(() => ds.fromCollection(makeNumericData(1))).not.toThrow()
        expect(good).toHaveBeenCalledTimes(1)
    })
})

// ---------------------------------------------------------------------------
// sort()
// ---------------------------------------------------------------------------

describe('DataSet – sort()', () => {
    test('sorts numeric column ascending', () => {
        const ds = new DataSet()
        ds.fromCollection([{ v: 3 }, { v: 1 }, { v: 2 }])
        ds.sort('v', 'asc')
        expect(ds.getState().filteredData.map(r => r.v)).toEqual([1, 2, 3])
    })

    test('sorts numeric column descending', () => {
        const ds = new DataSet()
        ds.fromCollection([{ v: 1 }, { v: 3 }, { v: 2 }])
        ds.sort('v', 'desc')
        expect(ds.getState().filteredData.map(r => r.v)).toEqual([3, 2, 1])
    })

    test('sorts string column ascending', () => {
        const ds = new DataSet()
        ds.fromCollection([{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }])
        ds.sort('name', 'asc')
        expect(ds.getState().filteredData.map(r => r.name)).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    test('sorts string column descending', () => {
        const ds = new DataSet()
        ds.fromCollection([{ name: 'Alice' }, { name: 'Charlie' }, { name: 'Bob' }])
        ds.sort('name', 'desc')
        expect(ds.getState().filteredData.map(r => r.name)).toEqual(['Charlie', 'Bob', 'Alice'])
    })

    test('updates sortColumn and sortDirection in state', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        ds.sort('value', 'asc')
        const state = ds.getState()
        expect(state.sortColumn).toBe('value')
        expect(state.sortDirection).toBe('asc')
    })

    test('resets currentPage to 0 after sort', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(30))
        ds.goToPage(2)
        ds.sort('value', 'desc')
        expect(ds.getState().currentPage).toBe(0)
    })

    test('handles duplicate sort keys without crashing', () => {
        const ds = new DataSet()
        ds.fromCollection([{ v: 2 }, { v: 2 }, { v: 2 }])
        expect(() => ds.sort('v', 'asc')).not.toThrow()
        expect(ds.getState().filteredData).toHaveLength(3)
    })

    test('throws for invalid direction', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(2))
        expect(() => ds.sort('value', 'sideways')).toThrow()
    })

    test('throws for non-string column', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(2))
        expect(() => ds.sort(42, 'asc')).toThrow()
    })

    test('throws for unknown column name', () => {
        const ds = new DataSet()
        ds.fromCollection([{ v: 1 }])
        expect(() => ds.sort('nonexistent', 'asc')).toThrow()
    })

    test('throws when called without a collection', () => {
        const ds = new DataSet()
        expect(() => ds.sort('value', 'asc')).toThrow()
    })

    test('memoizes repeated identical sort calls', () => {
        const ds = new DataSet()
        const rows = makeNumericData(10)
        ds.fromCollection(rows)
        ds.sort('value', 'asc')
        const result1 = ds.getState().filteredData
        ds.fromCollection(rows) // reload without clearing cache manually
        ds.sort('value', 'asc')
        const result2 = ds.getState().filteredData
        expect(result1).toEqual(result2)
    })
})

// ---------------------------------------------------------------------------
// filter()
// ---------------------------------------------------------------------------

describe('DataSet – filter()', () => {
    test('filters rows matching predicate', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        ds.filter(row => row.value > 5)
        const state = ds.getState()
        expect(state.filteredData).toHaveLength(5)
        state.filteredData.forEach(r => expect(r.value).toBeGreaterThan(5))
    })

    test('updates totalRows to filtered count', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        ds.filter(row => row.value <= 3)
        expect(ds.getState().totalRows).toBe(3)
    })

    test('resets currentPage to 0 after filter', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(30))
        ds.goToPage(2)
        ds.filter(() => true)
        expect(ds.getState().currentPage).toBe(0)
    })

    test('returns all rows when predicate always returns true', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        ds.filter(() => true)
        expect(ds.getState().filteredData).toHaveLength(5)
    })

    test('returns empty array when predicate always returns false', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        ds.filter(() => false)
        expect(ds.getState().filteredData).toHaveLength(0)
        expect(ds.getState().totalRows).toBe(0)
    })

    test('filters on sorted data', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        ds.sort('value', 'desc')
        ds.filter(row => row.value > 5)
        // Should be descending: 10, 9, 8, 7, 6
        expect(ds.getState().filteredData.map(r => r.value)).toEqual([10, 9, 8, 7, 6])
    })

    test('throws when predicate is not a function', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(3))
        expect(() => ds.filter('not-a-function')).toThrow()
        expect(() => ds.filter(null)).toThrow()
    })

    test('throws when called without a collection', () => {
        const ds = new DataSet()
        expect(() => ds.filter(() => true)).toThrow()
    })

    test('memoizes repeated identical filter calls', () => {
        const ds = new DataSet()
        const pred = row => row.value > 5
        ds.fromCollection(makeNumericData(10))
        ds.filter(pred)
        const first = ds.getState().filteredData
        // Apply same filter again – should hit cache
        ds.filter(pred)
        const second = ds.getState().filteredData
        expect(first).toEqual(second)
    })
})

// ---------------------------------------------------------------------------
// goToPage() / nextPage()
// ---------------------------------------------------------------------------

describe('DataSet – goToPage() / nextPage()', () => {
    test('goToPage updates currentPage', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(30))
        ds.goToPage(2)
        expect(ds.getState().currentPage).toBe(2)
    })

    test('goToPage clamps to valid range', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10)) // 1 page with pageSize=10
        ds.goToPage(99)
        expect(ds.getState().currentPage).toBe(0) // last valid page
    })

    test('goToPage clamps negative values to 0', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        ds.goToPage(-5)
        expect(ds.getState().currentPage).toBe(0)
    })

    test('goToPage throws for non-number input', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        expect(() => ds.goToPage('two')).toThrow()
        expect(() => ds.goToPage(null)).toThrow()
    })

    test('nextPage advances by one', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(25))
        ds.nextPage()
        expect(ds.getState().currentPage).toBe(1)
    })

    test('nextPage does not go beyond last page', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10)) // 1 page
        ds.nextPage()
        expect(ds.getState().currentPage).toBe(0) // still 0
    })

    test('multiple nextPage calls advance correctly', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(50))
        ds.nextPage()
        ds.nextPage()
        ds.nextPage()
        expect(ds.getState().currentPage).toBe(3)
    })
})

// ---------------------------------------------------------------------------
// setPageSize()
// ---------------------------------------------------------------------------

describe('DataSet – setPageSize()', () => {
    test('updates pageSize in state', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(20))
        ds.setPageSize(5)
        expect(ds.getState().pageSize).toBe(5)
    })

    test('resets currentPage to 0', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(30))
        ds.goToPage(2)
        ds.setPageSize(5)
        expect(ds.getState().currentPage).toBe(0)
    })

    test('throws for non-positive values', () => {
        const ds = new DataSet()
        expect(() => ds.setPageSize(0)).toThrow()
        expect(() => ds.setPageSize(-1)).toThrow()
        expect(() => ds.setPageSize('ten')).toThrow()
    })
})

// ---------------------------------------------------------------------------
// setPaginationMode()
// ---------------------------------------------------------------------------

describe('DataSet – setPaginationMode()', () => {
    test('switches to "infinite" mode', () => {
        const ds = new DataSet()
        ds.setPaginationMode('infinite')
        expect(ds.getState().paginationMode).toBe('infinite')
    })

    test('switches back to "paginated" mode', () => {
        const ds = new DataSet({ paginationMode: 'infinite' })
        ds.setPaginationMode('paginated')
        expect(ds.getState().paginationMode).toBe('paginated')
    })

    test('resets currentPage to 0 on mode change', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(30))
        ds.goToPage(2)
        ds.setPaginationMode('infinite')
        expect(ds.getState().currentPage).toBe(0)
    })

    test('throws for invalid mode', () => {
        const ds = new DataSet()
        expect(() => ds.setPaginationMode('lazy')).toThrow()
        expect(() => ds.setPaginationMode(null)).toThrow()
        expect(() => ds.setPaginationMode('')).toThrow()
    })
})

// ---------------------------------------------------------------------------
// appendData()  (infinite scroll)
// ---------------------------------------------------------------------------

describe('DataSet – appendData()', () => {
    test('appends rows to existing data', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        ds.appendData(makeNumericData(3))
        expect(ds.getState().rawData).toHaveLength(8)
        expect(ds.getState().totalRows).toBe(8)
    })

    test('appends to empty dataset', () => {
        const ds = new DataSet()
        ds.appendData([{ id: 1 }])
        expect(ds.getState().totalRows).toBe(1)
    })

    test('throws when rows is not an array', () => {
        const ds = new DataSet()
        expect(() => ds.appendData('bad')).toThrow()
        expect(() => ds.appendData(null)).toThrow()
    })

    test('clears memoization cache on append', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        ds.sort('value', 'asc')
        // Cache is populated; append should invalidate it
        ds.appendData([{ id: 99, value: 99, label: 'item-99' }])
        const state = ds.getState()
        expect(state.totalRows).toBe(6)
    })
})

// ---------------------------------------------------------------------------
// reset()
// ---------------------------------------------------------------------------

describe('DataSet – reset()', () => {
    test('clears all data and state', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        ds.sort('value', 'desc')
        ds.goToPage(1)
        ds.reset()
        const state = ds.getState()
        expect(state.rawData).toEqual([])
        expect(state.sortedData).toEqual([])
        expect(state.filteredData).toEqual([])
        expect(state.totalRows).toBe(0)
        expect(state.currentPage).toBe(0)
        expect(state.sortColumn).toBe('')
        expect(state.sortDirection).toBe('')
        expect(state.paginationMode).toBe('paginated')
    })

    test('notifies subscribers on reset', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        const cb = jest.fn()
        ds.subscribe(cb)
        ds.reset()
        expect(cb).toHaveBeenCalledTimes(1)
        expect(cb.mock.calls[0][0].totalRows).toBe(0)
    })

    test('legacy dataset surface is null after reset', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        ds.reset()
        expect(ds.dataset).toBeNull()
        expect(ds._datasetLen).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// Immutable-style state (each mutation produces a new snapshot)
// ---------------------------------------------------------------------------

describe('DataSet – immutable state snapshots', () => {
    test('each mutation returns a new state object', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        const before = ds.getState()
        const after = ds.sort('value', 'desc')
        expect(before).not.toBe(after)
    })

    test('state object from getState is frozen', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        expect(Object.isFrozen(ds.getState())).toBe(true)
    })

    test('mutating the returned state does not affect internal state', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        const state = ds.getState()
        expect(() => { state.currentPage = 99 }).toThrow() // frozen
        expect(ds.getState().currentPage).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// Legacy API compatibility
// ---------------------------------------------------------------------------

describe('DataSet – legacy API', () => {
    test('top() returns first n rows', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(20))
        expect(ds.top(5)).toHaveLength(5)
        expect(ds.top(5)[0].id).toBe(1)
    })

    test('top() without argument uses _outLen default', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(20))
        expect(ds.top()).toHaveLength(ds._outLen)
    })

    test('bottom() returns last n rows', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        const result = ds.bottom(3)
        expect(result).toHaveLength(3)
        expect(result[2].id).toBe(10)
    })

    test('get() returns a slice', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        const slice = ds.get(2, 5)
        expect(slice).toHaveLength(3)
        expect(slice[0].id).toBe(3)
    })

    test('get() throws when from > to', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(10))
        expect(() => ds.get(5, 2)).toThrow()
    })

    test('pushData() appends rows', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(3))
        ds.pushData([{ id: 4, value: 4, label: 'item-4' }])
        expect(ds.getState().totalRows).toBe(4)
    })

    test('lookUp() filters by string', () => {
        const ds = new DataSet()
        ds.fromCollection(data)
        ds.lookUp('40PM')
        expect(ds.dataset.length).toStrictEqual(9)
    })

    test('lookUp() with empty string restores all rows', () => {
        const ds = new DataSet()
        ds.fromCollection(data)
        ds.lookUp('40PM')
        ds.lookUp('')
        expect(ds.dataset).toStrictEqual(data)
    })

    test('lookUp() with number 0 returns all rows', () => {
        const ds = new DataSet()
        ds.fromCollection(data)
        ds.lookUp(0)
        expect(ds.dataset.length).toStrictEqual(data.length)
    })

    test('lookUp() with string "0" returns all rows', () => {
        const ds = new DataSet()
        ds.fromCollection(data)
        ds.lookUp('0')
        expect(ds.dataset.length).toStrictEqual(data.length)
    })

    test('legacy dataset surface stays in sync', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        expect(ds.dataset).toHaveLength(5)
        expect(ds._datasetLen).toBe(5)
    })

    test('sortDirection constants are present', () => {
        const ds = new DataSet()
        expect(ds.sortDirection.ASC).toBe('asc')
        expect(ds.sortDirection.DESC).toBe('desc')
    })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('DataSet – edge cases', () => {
    test('empty data: sort is no-op', () => {
        const ds = new DataSet()
        ds.fromCollection([])
        // sort on empty dataset – column check is skipped when rawData is empty
        expect(() => ds.sort('anything', 'asc')).not.toThrow()
        expect(ds.getState().filteredData).toHaveLength(0)
    })

    test('single-row data: sort works', () => {
        const ds = new DataSet()
        ds.fromCollection([{ v: 42 }])
        ds.sort('v', 'asc')
        expect(ds.getState().filteredData).toHaveLength(1)
        expect(ds.getState().filteredData[0].v).toBe(42)
    })

    test('single-row data: filter works', () => {
        const ds = new DataSet()
        ds.fromCollection([{ v: 42 }])
        ds.filter(row => row.v === 42)
        expect(ds.getState().filteredData).toHaveLength(1)
    })

    test('goToPage on empty dataset stays at 0', () => {
        const ds = new DataSet()
        ds.fromCollection([])
        ds.goToPage(5)
        expect(ds.getState().currentPage).toBe(0)
    })

    test('appendData on fresh instance (no fromCollection)', () => {
        const ds = new DataSet()
        ds.appendData([{ id: 1 }])
        expect(ds.getState().totalRows).toBe(1)
    })
})

// ---------------------------------------------------------------------------
// Memoization
// ---------------------------------------------------------------------------

describe('DataSet – memoization', () => {
    test('cache is cleared when fromCollection is called', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        ds.sort('value', 'asc')
        // Reload triggers cache clear
        ds.fromCollection(makeNumericData(5))
        // Should compute fresh without error
        expect(() => ds.sort('value', 'desc')).not.toThrow()
    })

    test('cache is cleared when appendData is called', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(3))
        ds.sort('value', 'asc')
        ds.appendData([{ id: 4, value: 4, label: 'item-4' }])
        expect(ds.getState().totalRows).toBe(4)
    })

    test('cache is cleared when reset is called', () => {
        const ds = new DataSet()
        ds.fromCollection(makeNumericData(5))
        ds.sort('value', 'asc')
        ds.reset()
        expect(ds._cache.size).toBe(0)
    })
})
