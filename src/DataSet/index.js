import * as Utils from '../utils'

/**
 * DataSet – a pure, self-contained data-manager class.
 *
 * Handles sorting, filtering and pagination without any DOM / jQuery
 * dependencies.  Repeated calls to `sort()` or `filter()` with identical
 * arguments are served from an in-memory Map cache (simple key-based
 * memoization), making bulk table re-renders cheap.
 */
class DataSet {
    _name = 'dataset'

    // ─── internal state ───────────────────────────────────────────────────────

    /** The original, unmodified raw array supplied by the caller. */
    _rawData = []

    /**
     * The "working" dataset – may differ from `_rawData` when legacy helpers
     * such as `pushData` / `lookUp` are used by TableSortable.
     */
    dataset = []

    /** Serialised snapshot used by `lookUp` to restore after a search. */
    _cachedData = null

    _datasetLen = 0
    _outLen = 10

    /** Current options (sortKey, sortDir, filters, rowsPerPage, page). */
    _options = {
        sortKey: null,
        sortDir: 'asc',
        filters: {},
        rowsPerPage: 10,
        page: 0,
    }

    // ─── memoization caches ───────────────────────────────────────────────────

    /** Map<cacheKey, sortedArray> */
    _sortCache = new Map()

    /** Map<cacheKey, filteredArray> */
    _filterCache = new Map()

    // ─── sort-direction constants (kept for backward-compat) ──────────────────
    sortDirection = {
        ASC: 'asc',
        DESC: 'desc',
    }

    // ─── constructor ──────────────────────────────────────────────────────────

    /**
     * @param {Array}  [rawData=[]]   The initial dataset.
     * @param {Object} [options={}]   sortKey, sortDir, filters, rowsPerPage, page.
     */
    constructor(rawData = [], options = {}) {
        if (rawData && rawData.length) {
            this._loadData(rawData)
        }
        this._options = Object.assign({}, this._options, options)
    }

    // ─── private helpers ──────────────────────────────────────────────────────

    _formatError(condition, fn, msg, ...rest) {
        Utils._invariant(condition, `${this._name}.${fn} ${msg}`, ...rest)
    }

    /**
     * Guard that matches the original behaviour: only fails when `dataset` is
     * literally `null` (not when it is an empty array).  TableSortable creates
     * a DataSet with no data and still calls `get()`, so we must allow [].
     */
    _hasDataset() {
        this._formatError(
            this.dataset !== null,
            'data',
            'No source collection is provided. Add your collection to dataset with "dataset.fromCollection([{}])" or pass it to the constructor.'
        )
    }

    /** Internal helper that (re-)loads raw data and resets derived state. */
    _loadData(data) {
        this._formatError(
            Utils._isArray(data),
            'fromCollection',
            'Requires dataset to be a collection, like [{ }]'
        )
        this._rawData = data
        this.dataset = data.slice() // shallow copy so we never mutate the caller's array
        this._cachedData = JSON.stringify(data)
        this._datasetLen = data.length
        this._invalidateCache()
    }

    /** Clears both memoization caches after a data change. */
    _invalidateCache() {
        this._sortCache = new Map()
        this._filterCache = new Map()
    }

    /**
     * Build a stable string cache-key from an arbitrary plain value.
     * @param  {...*} parts
     * @returns {string}
     */
    _buildKey(...parts) {
        return parts.map(p => (typeof p === 'object' ? JSON.stringify(p) : String(p))).join('::')
    }

    // ─── public API ───────────────────────────────────────────────────────────

    // ── data loading ──────────────────────────────────────────────────────────

    /**
     * Legacy helper – kept for backward-compatibility with TableSortable.
     * Prefer `new DataSet(rawData)` or `setData(newData)`.
     * @param {Array} data
     */
    fromCollection(data) {
        this._loadData(data)
    }

    /**
     * Replaces the raw dataset and invalidates all memoization caches.
     * @param {Array} newData
     */
    setData(newData) {
        this._loadData(newData)
    }

    // ── sorting ───────────────────────────────────────────────────────────────

    /**
     * Returns a **new** array sorted by `key` in `direction` order.
     * Results are memoized: identical (key, direction) pairs skip
     * re-computation.
     *
     * @param  {string} key        Column / property name to sort by.
     * @param  {string} direction  `'asc'` or `'desc'`.
     * @returns {Array}
     */
    sort(key, direction) {
        this._hasDataset()
        this._formatError(Utils._isString(key), 'sort', 'Requires "column" type of string')
        this._formatError(Utils._isString(direction), 'sort', 'Requires "direction" type of string')
        this._formatError(
            direction === 'asc' || direction === 'desc',
            'sort',
            '"%s" is invalid sort direction. Use "dataset.sortDirection.ASC" or "dataset.sortDirection.DESC".',
            direction
        )

        const head = this.dataset[0]
        this._formatError(
            head !== undefined && typeof head[key] !== 'undefined',
            'sort',
            'Column name "%s" does not exist in collection',
            key
        )

        const cacheKey = this._buildKey(key, direction)

        if (this._sortCache.has(cacheKey)) {
            // ── cache hit ──────────────────────────────────────────────────
            const cached = this._sortCache.get(cacheKey)
            // Sync the internal working dataset so legacy callers still work.
            this.dataset = cached
            this._datasetLen = cached.length
            return cached
        }

        // ── cache miss – compute and store ────────────────────────────────
        const sorted = this.dataset.slice().sort((a, b) => {
            if (direction === 'asc') {
                return Utils._nativeCompare(a[key], b[key])
            }
            return Utils._nativeCompare(b[key], a[key])
        })

        this._sortCache.set(cacheKey, sorted)
        this.dataset = sorted
        this._datasetLen = sorted.length
        return sorted
    }

    // ── filtering ─────────────────────────────────────────────────────────────

    /**
     * Filters the **raw** dataset using a map of `{ columnKey: value }`
     * predicates (substring / equality match per column).  Results are
     * memoized by the serialised predicate map.
     *
     * Pass an empty object `{}` to clear all filters.
     *
     * @param  {Object} predicates  `{ columnKey: value, … }`
     * @returns {Array}
     */
    filter(predicates = {}) {
        this._formatError(
            predicates !== null && typeof predicates === 'object' && !Array.isArray(predicates),
            'filter',
            'Requires predicates to be a plain object like { columnKey: value }'
        )

        const cacheKey = this._buildKey(predicates)

        if (this._filterCache.has(cacheKey)) {
            const cached = this._filterCache.get(cacheKey)
            this.dataset = cached
            this._datasetLen = cached.length
            return cached
        }

        const keys = Object.keys(predicates)

        let filtered
        if (keys.length === 0) {
            // No predicates → return all raw data.
            filtered = this._rawData.slice()
        } else {
            filtered = this._rawData.filter(item => {
                return keys.every(col => {
                    const predValue = predicates[col]
                    if (predValue === undefined || predValue === null || predValue === '') {
                        return true
                    }
                    const itemValue = item[col]
                    if (itemValue === undefined) {
                        return false
                    }
                    // Substring match (case-insensitive) for strings; strict equality for others.
                    if (typeof predValue === 'string') {
                        return String(itemValue).toLowerCase().indexOf(predValue.toLowerCase()) > -1
                    }
                    return itemValue === predValue
                })
            })
        }

        this._filterCache.set(cacheKey, filtered)
        this.dataset = filtered
        this._datasetLen = filtered.length
        return filtered
    }

    // ── pagination ────────────────────────────────────────────────────────────

    /**
     * Returns the slice of the current working dataset that corresponds to
     * `page` (0-based).
     *
     * @param  {number} page         0-based page index.
     * @param  {number} rowsPerPage  Rows per page.
     * @returns {Array}
     */
    paginate(page, rowsPerPage) {
        this._formatError(Utils._isNumber(page), 'paginate', 'Requires "page" to be a number')
        this._formatError(
            Utils._isNumber(rowsPerPage) && rowsPerPage > 0,
            'paginate',
            'Requires "rowsPerPage" to be a positive number'
        )

        const source = this.dataset
        const total = source.length
        const from = Math.min(page * rowsPerPage, total)
        const to = Math.min(from + rowsPerPage, total)
        return source.slice(from, to)
    }

    // ── convenience helpers ───────────────────────────────────────────────────

    /**
     * Convenience method: applies current filters, then sort, then paginates.
     *
     * @param  {number} [page]  Defaults to `this._options.page`.
     * @returns {Array}
     */
    getPage(page) {
        const opts = this._options
        const targetPage = Utils._isNumber(page) ? page : opts.page
        const { rowsPerPage, sortKey, sortDir, filters } = opts

        // 1. filter
        this.filter(filters || {})

        // 2. sort (if a sort key is configured)
        if (sortKey) {
            this.sort(sortKey, sortDir || 'asc')
        }

        // 3. paginate
        return this.paginate(targetPage, rowsPerPage)
    }

    /**
     * Returns the total number of pages for the currently filtered dataset.
     *
     * @returns {number}
     */
    getTotalPages() {
        const { rowsPerPage } = this._options
        const rpp = Utils._isNumber(rowsPerPage) && rowsPerPage > 0 ? rowsPerPage : 10
        return Math.max(1, Math.ceil(this._datasetLen / rpp))
    }

    /**
     * Clears all memoization caches without discarding the raw dataset.
     */
    reset() {
        this._invalidateCache()
    }

    // ── legacy slice helpers (used by TableSortable) ──────────────────────────

    top(len) {
        this._hasDataset()
        if (len) {
            this._formatError(Utils._isNumber(len), 'top', 'Requires length to be a number')
            return this.dataset.slice(0, len)
        }
        return this.dataset.slice(0, this._outLen)
    }

    bottom(len) {
        this._hasDataset()
        if (len) {
            this._formatError(Utils._isNumber(len), 'bottom', 'Requires length to be a number')
            len = Math.max(this._datasetLen - len, 0)
            return this.dataset.slice(len, this._datasetLen)
        }
        len = Math.max(this._datasetLen - this._outLen, 0)
        return this.dataset.slice(len, this._datasetLen)
    }

    get(from, to) {
        this._hasDataset()
        this._formatError(Utils._isNumber(from), 'get', 'Requires "from" to be a number')
        this._formatError(Utils._isNumber(to), 'get', 'Requires "to" to be a number')
        this._formatError(!(from > to), 'get', '"from" cannot be greater than "to"')
        from = Math.max(from, 0)
        to = Math.min(to, this._datasetLen)
        return this.dataset.slice(from, to)
    }

    pushData(data) {
        if (Utils._isArray(data)) {
            Array.prototype.push.apply(this.dataset, data)
            this._datasetLen = this.dataset.length
            // Invalidate caches because data changed.
            this._invalidateCache()
        }
    }

    lookUp(str, columns) {
        if (Utils._isString(str) || Utils._isNumber(str)) {
            const cachedData = JSON.parse(this._cachedData)
            if (str === '') {
                this.dataset = cachedData
            } else {
                this.dataset = Utils._filter(cachedData, item =>
                    Utils.lookInObject(item, str, columns)
                )
            }
            this._datasetLen = this.dataset.length
        }
    }
}

export default DataSet
