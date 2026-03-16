/**
 * DataSet – Reactive State Manager
 *
 * A framework-agnostic state manager that drives all table operations with an
 * observable subscribe/unsubscribe pattern, immutable-style state snapshots,
 * and a simple memoization cache.
 *
 * @module DataSet
 */

import * as Utils from '../utils'

// ---------------------------------------------------------------------------
// JSDoc / TypeScript-compatible type definitions
// ---------------------------------------------------------------------------

/**
 * @typedef {'paginated'|'infinite'} PaginationMode
 */

/**
 * @typedef {Object} DataSetState
 * @property {Array<Object>} rawData        – The original, unmodified rows.
 * @property {Array<Object>} sortedData     – Rows after sorting is applied.
 * @property {Array<Object>} filteredData   – Rows after filtering is applied.
 * @property {number}        currentPage    – Zero-based current page index.
 * @property {number}        pageSize       – Number of rows per page.
 * @property {number}        totalRows      – Total number of rows after filtering.
 * @property {string}        sortColumn     – The column currently sorted on.
 * @property {string}        sortDirection  – 'asc' | 'desc' | ''.
 * @property {PaginationMode} paginationMode – 'paginated' | 'infinite'.
 */

/**
 * @typedef {Object} DataSetOptions
 * @property {Array<Object>} [data]           – Initial data rows.
 * @property {number}        [pageSize]        – Rows per page (default: 10).
 * @property {PaginationMode} [paginationMode] – 'paginated' | 'infinite' (default: 'paginated').
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build an initial (empty) state snapshot.
 * @returns {DataSetState}
 */
function _createInitialState() {
    return {
        rawData: [],
        sortedData: [],
        filteredData: [],
        currentPage: 0,
        pageSize: 10,
        totalRows: 0,
        sortColumn: '',
        sortDirection: '',
        paginationMode: 'paginated',
    }
}

/**
 * Return a shallow-frozen copy of a state object so consumers can't mutate it.
 * @param {DataSetState} state
 * @returns {DataSetState}
 */
function _freeze(state) {
    return Object.freeze(Object.assign({}, state))
}

// ---------------------------------------------------------------------------
// DataSet class
// ---------------------------------------------------------------------------

class DataSet {
    /** @private */
    _name = 'dataset'

    /**
     * Legacy surface – kept so existing TableSortable code that reaches into
     * `dataset.dataset`, `dataset._datasetLen` and `dataset.sortDirection`
     * continues to work without modification.
     */
    dataset = null
    _cachedData = null
    _datasetLen = 0
    _outLen = 10
    sortDirection = {
        ASC: 'asc',
        DESC: 'desc',
    }

    /** @private – current reactive state */
    _state = _createInitialState()

    /** @private – set of subscriber callbacks */
    _subscribers = new Set()

    /**
     * Simple memoization cache keyed on "sortColumn:sortDirection:filterKey".
     * @private
     */
    _cache = new Map()

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------

    /**
     * @param {DataSetOptions} [options]
     */
    constructor(options = {}) {
        const { data = [], pageSize = 10, paginationMode = 'paginated' } = options
        this._state = _freeze({
            ..._createInitialState(),
            pageSize,
            paginationMode,
        })
        if (data.length) {
            this.fromCollection(data)
        }
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    _formatError(condition, fn, msg, ...rest) {
        Utils._invariant(condition, `${this._name}.${fn} ${msg}`, ...rest)
    }

    _hasDataset() {
        this._formatError(
            this.dataset !== null,
            'data',
            'No source collection is provided. Add your collection to dataset with "dataset.fromCollection([{}])" method.'
        )
    }

    /**
     * Commit a partial state update, freeze it, and notify subscribers.
     * @private
     * @param {Partial<DataSetState>} patch
     * @returns {DataSetState} – the new frozen state
     */
    _commit(patch) {
        const next = _freeze(Object.assign({}, this._state, patch))
        this._state = next
        // Sync legacy surface
        this.dataset = this._state.filteredData.slice()
        this._datasetLen = this._state.totalRows
        this._notifySubscribers()
        return next
    }

    /**
     * Notify all subscribers with the current state snapshot.
     * @private
     */
    _notifySubscribers() {
        this._subscribers.forEach(fn => {
            try {
                fn(this._state)
            } catch (_) {
                // Isolate subscriber errors
            }
        })
    }

    /**
     * Build a cache key from the current sort + filter params.
     * @private
     * @param {string} filterKey
     * @returns {string}
     */
    _cacheKey(filterKey) {
        return `${this._state.sortColumn}:${this._state.sortDirection}:${filterKey}`
    }

    // -----------------------------------------------------------------------
    // Subscription API
    // -----------------------------------------------------------------------

    /**
     * Subscribe to state changes. The callback is invoked with the new
     * frozen `DataSetState` snapshot on every mutation.
     *
     * @param {function(DataSetState): void} callback
     * @returns {function(): void} – an unsubscribe function
     */
    subscribe(callback) {
        this._formatError(
            Utils._isFunction(callback),
            'subscribe',
            'Requires a function as the subscriber callback'
        )
        this._subscribers.add(callback)
        return () => this.unsubscribe(callback)
    }

    /**
     * Remove a previously registered subscriber.
     * @param {function} callback
     */
    unsubscribe(callback) {
        this._subscribers.delete(callback)
    }

    // -----------------------------------------------------------------------
    // Public state accessor
    // -----------------------------------------------------------------------

    /**
     * Return the current immutable state snapshot.
     * @returns {DataSetState}
     */
    getState() {
        return this._state
    }

    // -----------------------------------------------------------------------
    // Data ingestion
    // -----------------------------------------------------------------------

    /**
     * Load an entirely new collection, replacing any existing data.
     * @param {Array<Object>} data
     */
    fromCollection(data) {
        this._formatError(
            Utils._isArray(data),
            'fromCollection',
            'Requires dataset to be a collection, like [{ }]'
        )
        this._cache.clear()
        const raw = data.slice() // defensive copy
        this._cachedData = JSON.stringify(raw)
        this._commit({
            rawData: raw,
            sortedData: raw.slice(),
            filteredData: raw.slice(),
            totalRows: raw.length,
            currentPage: 0,
            sortColumn: '',
            sortDirection: '',
        })
    }

    // -----------------------------------------------------------------------
    // Pure mutation methods
    // -----------------------------------------------------------------------

    /**
     * Sort the dataset by a column and direction. Results are memoized.
     *
     * @param {string} column
     * @param {'asc'|'desc'} direction
     * @returns {DataSetState}
     */
    sort(column, direction) {
        this._hasDataset()
        this._formatError(Utils._isString(column), 'sort', 'Requires "column" type of string')
        this._formatError(
            Utils._isString(direction),
            'sort',
            'Requires "direction" type of string'
        )
        this._formatError(
            direction === 'asc' || direction === 'desc',
            'sort',
            '"%s" is invalid sort direction. Use "asc" or "desc".',
            direction
        )

        if (this._state.rawData.length > 0) {
            const head = this._state.rawData[0]
            this._formatError(
                typeof head[column] !== 'undefined',
                'sort',
                'Column name "%s" does not exist in collection',
                column
            )
        }

        const cacheKey = this._cacheKey(`sort:${column}:${direction}`)
        if (this._cache.has(cacheKey)) {
            const cached = this._cache.get(cacheKey)
            const state = this._commit({
                sortedData: cached,
                filteredData: cached.slice(),
                totalRows: cached.length,
                currentPage: 0,
                sortColumn: column,
                sortDirection: direction,
            })
            return state
        }

        const base = this._state.rawData.slice()
        if (direction === 'asc') {
            base.sort((a, b) => Utils._nativeCompare(a[column], b[column]))
        } else {
            base.sort((a, b) => Utils._nativeCompare(b[column], a[column]))
        }

        this._cache.set(cacheKey, base)

        return this._commit({
            sortedData: base,
            filteredData: base.slice(),
            totalRows: base.length,
            currentPage: 0,
            sortColumn: column,
            sortDirection: direction,
        })
    }

    /**
     * Filter the sorted dataset using a predicate function. Results are
     * memoized on the predicate's string representation.
     *
     * @param {function(Object, number): boolean} predicate
     * @returns {DataSetState}
     */
    filter(predicate) {
        this._hasDataset()
        this._formatError(
            Utils._isFunction(predicate),
            'filter',
            'Requires a function as predicate'
        )

        const filterKey = predicate.toString()
        const cacheKey = this._cacheKey(filterKey)

        if (this._cache.has(cacheKey)) {
            const cached = this._cache.get(cacheKey)
            return this._commit({
                filteredData: cached,
                totalRows: cached.length,
                currentPage: 0,
            })
        }

        const source = this._state.sortedData.slice()
        const filtered = Utils._filter(source, predicate)

        this._cache.set(cacheKey, filtered)

        return this._commit({
            filteredData: filtered,
            totalRows: filtered.length,
            currentPage: 0,
        })
    }

    /**
     * Navigate to a specific page (zero-based).
     * @param {number} n – zero-based page number
     * @returns {DataSetState}
     */
    goToPage(n) {
        this._formatError(Utils._isNumber(n), 'goToPage', 'Requires "n" to be a number')
        const totalPages = Math.max(
            1,
            Math.ceil(this._state.totalRows / this._state.pageSize)
        )
        const page = Math.max(0, Math.min(n, totalPages - 1))
        return this._commit({ currentPage: page })
    }

    /**
     * Advance to the next page (no-op if already on the last page).
     * @returns {DataSetState}
     */
    nextPage() {
        const { currentPage, totalRows, pageSize } = this._state
        const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
        if (currentPage < totalPages - 1) {
            return this._commit({ currentPage: currentPage + 1 })
        }
        return this._state
    }

    /**
     * Change the number of rows per page and reset to page 0.
     * @param {number} n
     * @returns {DataSetState}
     */
    setPageSize(n) {
        this._formatError(
            Utils._isNumber(n) && n > 0,
            'setPageSize',
            'Requires "n" to be a positive number'
        )
        return this._commit({ pageSize: n, currentPage: 0 })
    }

    /**
     * Switch between 'paginated' and 'infinite' modes.
     * @param {'paginated'|'infinite'} mode
     * @returns {DataSetState}
     */
    setPaginationMode(mode) {
        this._formatError(
            mode === 'paginated' || mode === 'infinite',
            'setPaginationMode',
            '"mode" must be "paginated" or "infinite"'
        )
        return this._commit({ paginationMode: mode, currentPage: 0 })
    }

    /**
     * Append additional rows to the dataset (used for infinite scroll).
     * @param {Array<Object>} rows
     * @returns {DataSetState}
     */
    appendData(rows) {
        this._formatError(
            Utils._isArray(rows),
            'appendData',
            'Requires "rows" to be an array of objects'
        )
        this._cache.clear()
        const raw = this._state.rawData.concat(rows)
        this._cachedData = JSON.stringify(raw)
        return this._commit({
            rawData: raw,
            sortedData: raw.slice(),
            filteredData: raw.slice(),
            totalRows: raw.length,
        })
    }

    /**
     * Reset the dataset to its initial empty state and clear all caches.
     * @returns {DataSetState}
     */
    reset() {
        this._cache.clear()
        this._cachedData = null
        const next = this._commit({
            rawData: [],
            sortedData: [],
            filteredData: [],
            currentPage: 0,
            totalRows: 0,
            sortColumn: '',
            sortDirection: '',
            paginationMode: 'paginated',
        })
        this.dataset = null
        this._datasetLen = 0
        return next
    }

    // -----------------------------------------------------------------------
    // Legacy API – preserved for backward compatibility with TableSortable
    // -----------------------------------------------------------------------

    top(len) {
        this._hasDataset()
        const data = this._state.filteredData
        if (len) {
            this._formatError(Utils._isNumber(len), 'top', 'Requires length to be a number')
            return data.slice(0, len)
        }
        return data.slice(0, this._outLen)
    }

    bottom(len) {
        this._hasDataset()
        const data = this._state.filteredData
        const dataLen = data.length
        if (len) {
            this._formatError(Utils._isNumber(len), 'bottom', 'Requires length to be a number')
            len = Math.max(dataLen - len, 0)
            return data.slice(len, dataLen)
        }
        const start = Math.max(dataLen - this._outLen, 0)
        return data.slice(start, dataLen)
    }

    get(from, to) {
        this._hasDataset()
        this._formatError(Utils._isNumber(from), 'get', 'Requires "from" to be a number')
        this._formatError(Utils._isNumber(to), 'get', 'Requires "to" to be a number')
        this._formatError(!(from > to), 'get', '"from" cannot be greater than "to"')
        const data = this._state.filteredData
        const dataLen = data.length
        from = Math.max(from, 0)
        to = Math.min(to, dataLen)
        return data.slice(from, to)
    }

    pushData(data) {
        if (Utils._isArray(data)) {
            this.appendData(data)
        }
    }

    lookUp(str, columns) {
        if (Utils._isString(str) || Utils._isNumber(str)) {
            const cachedData = JSON.parse(this._cachedData || '[]')
            if (str === '') {
                this._commit({
                    sortedData: cachedData,
                    filteredData: cachedData.slice(),
                    totalRows: cachedData.length,
                    currentPage: 0,
                })
            } else {
                const filtered = Utils._filter(cachedData, item =>
                    Utils.lookInObject(item, str, columns)
                )
                this._commit({
                    filteredData: filtered,
                    totalRows: filtered.length,
                    currentPage: 0,
                })
            }
        }
    }
}

export default DataSet
