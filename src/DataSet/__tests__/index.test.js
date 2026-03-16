/**
 * Unit tests for the refactored DataSet module.
 *
 * Coverage:
 *  - Initial load (constructor + fromCollection / setData)
 *  - sort() – cache miss path + cache hit (memoization)
 *  - filter() – single-column, multi-column, empty predicates
 *  - paginate() – first page, middle page, last page, boundary conditions
 *  - getPage() – combined filter + sort + paginate convenience helper
 *  - getTotalPages() – various dataset / rowsPerPage combinations
 *  - reset() – cache invalidation
 *  - Legacy helpers: top(), bottom(), get(), lookUp(), pushData()
 */

import DataSet from '../'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const makeData = (n = 10) =>
    Array.from({ length: n }, (_, i) => ({
        id: i + 1,
        name: `Item ${String.fromCharCode(65 + (i % 26))}`,
        value: (n - i) * 10,       // descending so default order ≠ sorted order
        category: i % 3 === 0 ? 'alpha' : i % 3 === 1 ? 'beta' : 'gamma',
    }))

const RAW = makeData(20)

// ─── Construction ─────────────────────────────────────────────────────────────

describe('DataSet – initial load', () => {
    test('constructs with no arguments without throwing', () => {
        expect(() => new DataSet()).not.toThrow()
    })

    test('constructs with rawData array', () => {
        const ds = new DataSet(RAW)
        expect(ds.dataset).toHaveLength(RAW.length)
        expect(ds._datasetLen).toBe(RAW.length)
    })

    test('constructor options are merged into _options', () => {
        const ds = new DataSet(RAW, { rowsPerPage: 5, page: 1 })
        expect(ds._options.rowsPerPage).toBe(5)
        expect(ds._options.page).toBe(1)
    })

    test('dataset is a shallow copy – mutating it does not affect _rawData', () => {
        const ds = new DataSet(RAW)
        ds.dataset.push({ id: 999, name: 'extra', value: 0, category: 'x' })
        expect(ds._rawData).toHaveLength(RAW.length)
    })
})

// ─── setData / fromCollection ─────────────────────────────────────────────────

describe('DataSet – setData & fromCollection', () => {
    test('setData replaces the dataset', () => {
        const ds = new DataSet(RAW)
        const newData = makeData(5)
        ds.setData(newData)
        expect(ds.dataset).toHaveLength(5)
        expect(ds._datasetLen).toBe(5)
    })

    test('fromCollection replaces the dataset (legacy API)', () => {
        const ds = new DataSet()
        ds.fromCollection(RAW)
        expect(ds.dataset).toHaveLength(RAW.length)
    })

    test('setData throws when given a non-array', () => {
        const ds = new DataSet(RAW)
        expect(() => ds.setData(null)).toThrow()
        expect(() => ds.setData('bad')).toThrow()
        expect(() => ds.setData(42)).toThrow()
    })

    test('setData invalidates the sort cache', () => {
        const ds = new DataSet(RAW)
        ds.sort('id', 'asc')
        expect(ds._sortCache.size).toBe(1)
        ds.setData(makeData(5))
        expect(ds._sortCache.size).toBe(0)
    })

    test('setData invalidates the filter cache', () => {
        const ds = new DataSet(RAW)
        ds.filter({ category: 'alpha' })
        expect(ds._filterCache.size).toBe(1)
        ds.setData(makeData(5))
        expect(ds._filterCache.size).toBe(0)
    })
})

// ─── sort() ──────────────────────────────────────────────────────────────────

describe('DataSet – sort()', () => {
    test('returns ascending sort by numeric key', () => {
        const ds = new DataSet(RAW)
        const result = ds.sort('value', 'asc')
        for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].value).toBeLessThanOrEqual(result[i + 1].value)
        }
    })

    test('returns descending sort by numeric key', () => {
        const ds = new DataSet(RAW)
        const result = ds.sort('value', 'desc')
        for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].value).toBeGreaterThanOrEqual(result[i + 1].value)
        }
    })

    test('returns ascending sort by string key', () => {
        const ds = new DataSet(RAW)
        const result = ds.sort('name', 'asc')
        for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].name <= result[i + 1].name).toBe(true)
        }
    })

    // ── memoization ────────────────────────────────────────────────────────

    test('sort cache miss: cache is populated on first call', () => {
        const ds = new DataSet(RAW)
        expect(ds._sortCache.size).toBe(0)
        ds.sort('id', 'asc')
        expect(ds._sortCache.size).toBe(1)
    })

    test('sort cache hit: second call with same args skips recomputation', () => {
        const ds = new DataSet(RAW)

        // Patch Array.prototype.sort so we can count how many times it is called.
        const sortSpy = jest.spyOn(Array.prototype, 'sort')

        ds.sort('id', 'asc') // cache miss → sort is called
        const callsAfterMiss = sortSpy.mock.calls.length

        ds.sort('id', 'asc') // cache hit → sort should NOT be called again
        const callsAfterHit = sortSpy.mock.calls.length

        expect(callsAfterHit).toBe(callsAfterMiss) // no extra sort

        sortSpy.mockRestore()
    })

    test('sort cache: different keys produce different cache entries', () => {
        const ds = new DataSet(RAW)
        ds.sort('id', 'asc')
        ds.sort('value', 'asc')
        ds.sort('id', 'desc')
        expect(ds._sortCache.size).toBe(3)
    })

    test('sort cache hit returns the same array reference', () => {
        const ds = new DataSet(RAW)
        const first = ds.sort('id', 'asc')
        const second = ds.sort('id', 'asc')
        expect(first).toBe(second)
    })

    test('sort throws for invalid direction', () => {
        const ds = new DataSet(RAW)
        expect(() => ds.sort('id', 'up')).toThrow()
        expect(() => ds.sort('id', 'ASC')).toThrow()
    })

    test('sort throws for non-existent column', () => {
        const ds = new DataSet(RAW)
        expect(() => ds.sort('nonExistentColumn', 'asc')).toThrow()
    })

    test('sort throws when dataset is empty', () => {
        const ds = new DataSet()
        expect(() => ds.sort('id', 'asc')).toThrow()
    })
})

// ─── filter() ────────────────────────────────────────────────────────────────

describe('DataSet – filter()', () => {
    test('empty predicates returns the full raw dataset', () => {
        const ds = new DataSet(RAW)
        const result = ds.filter({})
        expect(result).toHaveLength(RAW.length)
    })

    test('filters by a single string column (substring, case-insensitive)', () => {
        const ds = new DataSet(RAW)
        // All items whose category contains 'alpha'
        const result = ds.filter({ category: 'alpha' })
        expect(result.every(r => r.category === 'alpha')).toBe(true)
        expect(result.length).toBeGreaterThan(0)
    })

    test('filters by a single numeric column (strict equality)', () => {
        const ds = new DataSet(RAW)
        const target = RAW[2].id
        const result = ds.filter({ id: target })
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe(target)
    })

    test('multi-column predicates are AND-ed', () => {
        const ds = new DataSet(RAW)
        const result = ds.filter({ category: 'alpha', value: RAW[0].value })
        // Must match both predicates simultaneously.
        result.forEach(r => {
            expect(r.category).toBe('alpha')
            expect(r.value).toBe(RAW[0].value)
        })
    })

    test('filter returns empty array when nothing matches', () => {
        const ds = new DataSet(RAW)
        const result = ds.filter({ category: 'delta' }) // 'delta' does not exist
        expect(result).toHaveLength(0)
    })

    // ── memoization ────────────────────────────────────────────────────────

    test('filter cache miss: populated on first call', () => {
        const ds = new DataSet(RAW)
        expect(ds._filterCache.size).toBe(0)
        ds.filter({ category: 'beta' })
        expect(ds._filterCache.size).toBe(1)
    })

    test('filter cache hit: same result reference returned on repeat call', () => {
        const ds = new DataSet(RAW)
        const first = ds.filter({ category: 'beta' })
        const second = ds.filter({ category: 'beta' })
        expect(first).toBe(second)
    })

    test('different predicates produce separate cache entries', () => {
        const ds = new DataSet(RAW)
        ds.filter({ category: 'alpha' })
        ds.filter({ category: 'beta' })
        ds.filter({ category: 'gamma' })
        expect(ds._filterCache.size).toBe(3)
    })

    test('filter throws for non-object predicates', () => {
        const ds = new DataSet(RAW)
        expect(() => ds.filter('bad')).toThrow()
        expect(() => ds.filter(null)).toThrow()
        expect(() => ds.filter([1, 2])).toThrow()
    })

    test('filter operates on _rawData so successive calls are independent', () => {
        const ds = new DataSet(RAW)
        const first = ds.filter({ category: 'alpha' })
        const second = ds.filter({ category: 'beta' })
        // Ensure they don't share items that shouldn't overlap.
        expect(first.every(r => r.category === 'alpha')).toBe(true)
        expect(second.every(r => r.category === 'beta')).toBe(true)
    })
})

// ─── paginate() ──────────────────────────────────────────────────────────────

describe('DataSet – paginate()', () => {
    test('first page returns correct slice', () => {
        const ds = new DataSet(RAW)
        const page = ds.paginate(0, 5)
        expect(page).toHaveLength(5)
        expect(page[0]).toEqual(ds.dataset[0])
        expect(page[4]).toEqual(ds.dataset[4])
    })

    test('second page returns correct slice', () => {
        const ds = new DataSet(RAW)
        const page = ds.paginate(1, 5)
        expect(page).toHaveLength(5)
        expect(page[0]).toEqual(ds.dataset[5])
    })

    test('last page returns remaining items (may be < rowsPerPage)', () => {
        const ds = new DataSet(makeData(13))
        const page = ds.paginate(2, 5) // items 10–12 → 3 items
        expect(page).toHaveLength(3)
    })

    test('page beyond dataset length returns empty array', () => {
        const ds = new DataSet(RAW)
        const page = ds.paginate(100, 5)
        expect(page).toHaveLength(0)
    })

    test('page 0 with rowsPerPage larger than dataset returns all items', () => {
        const ds = new DataSet(makeData(5))
        const page = ds.paginate(0, 100)
        expect(page).toHaveLength(5)
    })

    test('paginate throws for non-number page', () => {
        const ds = new DataSet(RAW)
        expect(() => ds.paginate('first', 5)).toThrow()
    })

    test('paginate throws for non-positive rowsPerPage', () => {
        const ds = new DataSet(RAW)
        expect(() => ds.paginate(0, 0)).toThrow()
        expect(() => ds.paginate(0, -1)).toThrow()
    })

    test('boundary: page 0, rowsPerPage 1 → only first item', () => {
        const ds = new DataSet(RAW)
        const page = ds.paginate(0, 1)
        expect(page).toHaveLength(1)
        expect(page[0]).toEqual(ds.dataset[0])
    })

    test('boundary: exactly rowsPerPage items on last page', () => {
        const ds = new DataSet(makeData(10))
        const page = ds.paginate(1, 5) // items 5–9 → exactly 5
        expect(page).toHaveLength(5)
    })
})

// ─── getPage() ───────────────────────────────────────────────────────────────

describe('DataSet – getPage()', () => {
    test('returns correct items when no sort or filter configured', () => {
        const ds = new DataSet(RAW, { rowsPerPage: 5, page: 0 })
        const page = ds.getPage()
        expect(page).toHaveLength(5)
    })

    test('applies filter before paginating', () => {
        const ds = new DataSet(RAW, { rowsPerPage: 3, page: 0, filters: { category: 'alpha' } })
        const page = ds.getPage()
        expect(page.every(r => r.category === 'alpha')).toBe(true)
        expect(page.length).toBeLessThanOrEqual(3)
    })

    test('applies sort before paginating', () => {
        const ds = new DataSet(RAW, { rowsPerPage: 5, page: 0, sortKey: 'value', sortDir: 'asc' })
        const page = ds.getPage()
        // First item should have the smallest value in the dataset.
        const minValue = Math.min(...RAW.map(r => r.value))
        expect(page[0].value).toBe(minValue)
    })

    test('explicit page argument overrides option', () => {
        const ds = new DataSet(RAW, { rowsPerPage: 5, page: 0 })
        const page1 = ds.getPage(0)
        const page2 = ds.getPage(1)
        expect(page1[0]).not.toEqual(page2[0])
    })
})

// ─── getTotalPages() ─────────────────────────────────────────────────────────

describe('DataSet – getTotalPages()', () => {
    test('returns 1 for empty dataset', () => {
        const ds = new DataSet([], { rowsPerPage: 5 })
        expect(ds.getTotalPages()).toBe(1)
    })

    test('calculates total pages correctly (evenly divisible)', () => {
        const ds = new DataSet(makeData(20), { rowsPerPage: 5 })
        expect(ds.getTotalPages()).toBe(4)
    })

    test('calculates total pages correctly (not evenly divisible)', () => {
        const ds = new DataSet(makeData(21), { rowsPerPage: 5 })
        expect(ds.getTotalPages()).toBe(5)
    })

    test('reflects filtered dataset length after filter()', () => {
        const ds = new DataSet(RAW, { rowsPerPage: 3 })
        // Filter to 'alpha' items – 20 items / 3 = ~7 alphas (every 3rd)
        ds.filter({ category: 'alpha' })
        const totalPages = ds.getTotalPages()
        expect(totalPages).toBe(Math.max(1, Math.ceil(ds._datasetLen / 3)))
    })

    test('handles rowsPerPage === 1', () => {
        const ds = new DataSet(makeData(7), { rowsPerPage: 1 })
        expect(ds.getTotalPages()).toBe(7)
    })
})

// ─── reset() ─────────────────────────────────────────────────────────────────

describe('DataSet – reset()', () => {
    test('clears sort cache', () => {
        const ds = new DataSet(RAW)
        ds.sort('id', 'asc')
        ds.sort('value', 'desc')
        expect(ds._sortCache.size).toBe(2)
        ds.reset()
        expect(ds._sortCache.size).toBe(0)
    })

    test('clears filter cache', () => {
        const ds = new DataSet(RAW)
        ds.filter({ category: 'alpha' })
        ds.filter({ category: 'beta' })
        expect(ds._filterCache.size).toBe(2)
        ds.reset()
        expect(ds._filterCache.size).toBe(0)
    })

    test('raw data is preserved after reset()', () => {
        const ds = new DataSet(RAW)
        ds.reset()
        expect(ds._rawData).toHaveLength(RAW.length)
    })

    test('sort after reset() recomputes (cache miss again)', () => {
        const ds = new DataSet(RAW)
        ds.sort('id', 'asc')
        ds.reset()
        expect(ds._sortCache.size).toBe(0)
        ds.sort('id', 'asc')
        expect(ds._sortCache.size).toBe(1)
    })
})

// ─── Legacy helpers ──────────────────────────────────────────────────────────

describe('DataSet – legacy helpers (backward-compat)', () => {
    test('top() returns first N items', () => {
        const ds = new DataSet(RAW)
        expect(ds.top(3)).toHaveLength(3)
        expect(ds.top(3)[0]).toEqual(ds.dataset[0])
    })

    test('top() with no arg uses _outLen (10)', () => {
        const ds = new DataSet(RAW)
        expect(ds.top()).toHaveLength(10)
    })

    test('bottom() returns last N items', () => {
        const ds = new DataSet(RAW)
        const result = ds.bottom(3)
        expect(result).toHaveLength(3)
        expect(result[2]).toEqual(ds.dataset[ds._datasetLen - 1])
    })

    test('get() returns the requested range', () => {
        const ds = new DataSet(RAW)
        const result = ds.get(2, 7)
        expect(result).toHaveLength(5)
        expect(result[0]).toEqual(ds.dataset[2])
        expect(result[4]).toEqual(ds.dataset[6])
    })

    test('get() throws when from > to', () => {
        const ds = new DataSet(RAW)
        expect(() => ds.get(5, 2)).toThrow()
    })

    test('pushData() appends items and invalidates cache', () => {
        const ds = new DataSet(RAW)
        ds.sort('id', 'asc')
        expect(ds._sortCache.size).toBe(1)
        const extra = [{ id: 99, name: 'Extra', value: 5, category: 'alpha' }]
        ds.pushData(extra)
        expect(ds._sortCache.size).toBe(0)
        expect(ds._datasetLen).toBe(RAW.length + 1)
    })

    test('lookUp() filters dataset by string and restores on empty string', () => {
        const ds = new DataSet(RAW)
        ds.lookUp('alpha')
        expect(ds.dataset.every(r => r.category === 'alpha')).toBe(true)
        ds.lookUp('')
        expect(ds._datasetLen).toBe(RAW.length)
    })
})

// ─── Existing test from original test file ────────────────────────────────────

import { data } from '../../TableSortable/__mock__/data'

describe('Dataset (original lookUp test)', () => {
    test('lookUp dataset', () => {
        const dataset = new DataSet()
        dataset.fromCollection(data)
        dataset.lookUp('40PM')
        expect(dataset.dataset.length).toStrictEqual(9)
        dataset.lookUp('')
        expect(dataset.dataset).toStrictEqual(data)
        dataset.lookUp(0)
        expect(dataset.dataset.length).toStrictEqual(data.length)
        dataset.lookUp('0')
        expect(dataset.dataset.length).toStrictEqual(data.length)
    })
})
