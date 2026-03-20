/**
 * options.js — Configuration schema and normalisation for TableSortable
 *
 * Exports `normalizeOptions(raw)` which merges caller-supplied options against
 * the documented defaults and throws descriptive errors for invalid or
 * incompatible combinations.
 */

import * as Utils from '../utils'

/**
 * @typedef {Object} SortingIcons
 * @property {string} asc  - HTML markup used for the ascending-sort icon.
 * @property {string} desc - HTML markup used for the descending-sort icon.
 */

/**
 * @typedef {Object} TableSortableDefaults
 *
 * ─── Core ─────────────────────────────────────────────────────────────────────
 * @property {string|HTMLElement} element           - CSS selector or jQuery object for the root element.
 * @property {Array<Object>}      data              - Collection of row objects.
 * @property {Object}             columns           - Map of { columnKey: 'Column Label' }.
 * @property {boolean}            sorting           - Enable/disable column sorting (also accepts an array of column keys).
 * @property {boolean}            pagination        - Enable/disable pagination.
 * @property {string|null}        paginationContainer - CSS selector for a custom pagination container.
 * @property {number}             rowsPerPage       - Number of rows shown per page.
 * @property {Function|null}      formatCell        - Legacy per-cell formatter: (rowData, columnKey) => string|HTMLElement.
 * @property {Function|null}      formatHeader      - Legacy per-header formatter: (label, columnKey, index) => string|HTMLElement.
 * @property {string|null}        searchField       - CSS selector for an external search <input>.
 * @property {Object}             responsive        - Responsive breakpoint overrides { [viewportWidth]: optionsObj }.
 * @property {number}             totalPages        - Override the calculated total page count.
 * @property {SortingIcons}       sortingIcons      - Custom sort icons for asc/desc directions.
 * @property {string}             nextText          - HTML label for the "Next page" pagination button.
 * @property {string}             prevText          - HTML label for the "Previous page" pagination button.
 * @property {Function}           tableWillMount    - Lifecycle hook fired before the table is mounted.
 * @property {Function}           tableDidMount     - Lifecycle hook fired after the table is mounted.
 * @property {Function}           tableWillUpdate   - Lifecycle hook fired before each update.
 * @property {Function}           tableDidUpdate    - Lifecycle hook fired after each update.
 * @property {Function}           tableWillUnmount  - Lifecycle hook fired before the table is destroyed.
 * @property {Function}           tableDidUnmount   - Lifecycle hook fired after the table is destroyed.
 * @property {Function|null}      onPaginationChange - Callback fired when the active page changes: (currentPage, setPage) => void.
 *
 * ─── New customisation options ────────────────────────────────────────────────
 * @property {Object<string, string>} columnWidths
 *   Per-column CSS width values applied to `<col>` elements in a `<colgroup>`.
 *   Example: `{ formCode: '100px', formName: '30%' }`
 *
 * @property {Function|null} rowClassFn
 *   Returns additional CSS class(es) for a given row.
 *   Signature: `(rowData: Object, rowIndex: number) => string`
 *
 * @property {Object<string, Function>} cellRenderers
 *   Custom render callbacks keyed by column key.
 *   Each callback receives the cell value and the full row object and must
 *   return a string of HTML or a DOM / jQuery element.
 *   Signature: `(value: *, rowData: Object) => string|HTMLElement`
 *
 * @property {Object<string, Function>} headerRenderers
 *   Custom render callbacks for column header cells, keyed by column key.
 *   Each callback receives the column label and must return a string of HTML
 *   or a DOM / jQuery element.
 *   Signature: `(label: string) => string|HTMLElement`
 *
 * @property {boolean} stickyHeader
 *   When `true`, `position: sticky` CSS is applied to `<thead>` so that the
 *   header row stays visible while the user scrolls a long table.
 *
 * @property {string|Function|null} noDataTemplate
 *   Markup (or a factory function returning markup) rendered when the data
 *   collection is empty.
 *   Signature when function: `() => string`
 *
 * @property {string} tableClassName
 *   Additional CSS class(es) appended to the root `<table>` element.
 *
 * @property {Function|null} onRowClick
 *   Callback fired when the user clicks a data row.
 *   Signature: `(rowData: Object, rowIndex: number, event: Event) => void`
 */

/**
 * Default values for every supported option.
 *
 * @type {TableSortableDefaults}
 */
export const defaults = {
    // ── Core ──────────────────────────────────────────────────────────────────
    element: '',
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
    tableWillMount: () => {},
    tableDidMount: () => {},
    tableWillUpdate: () => {},
    tableDidUpdate: () => {},
    tableWillUnmount: () => {},
    tableDidUnmount: () => {},
    onPaginationChange: null,

    // ── New customisation options ──────────────────────────────────────────────
    /** @type {Object<string, string>} */
    columnWidths: {},

    /** @type {Function|null} */
    rowClassFn: null,

    /** @type {Object<string, Function>} */
    cellRenderers: {},

    /** @type {Object<string, Function>} */
    headerRenderers: {},

    /** @type {boolean} */
    stickyHeader: false,

    /** @type {string|Function|null} */
    noDataTemplate: null,

    /** @type {string} */
    tableClassName: '',

    /** @type {Function|null} */
    onRowClick: null,
}

/**
 * Throw a descriptive TableSortable error.
 *
 * @param {string} optionName - The option key that failed validation.
 * @param {string} message    - Human-readable explanation.
 */
function throwOptionError(optionName, message) {
    Utils._invariant(false, `options.${optionName}: ${message}`)
}

/**
 * normalizeOptions
 *
 * Merges `raw` user-supplied options with `defaults`, validates every
 * recognised key and throws a descriptive error for invalid values or
 * incompatible option combinations.
 *
 * @param {Partial<TableSortableDefaults>} raw - Caller-supplied option object.
 * @returns {TableSortableDefaults} Fully-populated, validated options object.
 */
export function normalizeOptions(raw) {
    if (!Utils._isObject(raw) || Utils._isArray(raw)) {
        throwOptionError('options', 'must be a plain object')
    }

    // Deep-merge: start from defaults, overlay caller values.
    const opts = Object.assign({}, defaults, raw)

    // ── data ──────────────────────────────────────────────────────────────────
    if (!Utils._isArray(opts.data)) {
        throwOptionError(
            'data',
            'must be an array of objects, e.g. [{ key: value }, ...]'
        )
    }

    // ── columns ───────────────────────────────────────────────────────────────
    if (!Utils._isObject(opts.columns) || Utils._isArray(opts.columns)) {
        throwOptionError('columns', 'must be a plain object mapping column keys to labels')
    }

    // ── rowsPerPage ───────────────────────────────────────────────────────────
    if (!Utils._isNumber(opts.rowsPerPage) || opts.rowsPerPage <= 0) {
        throwOptionError('rowsPerPage', 'must be a positive number')
    }

    // ── totalPages ────────────────────────────────────────────────────────────
    if (!Utils._isNumber(opts.totalPages)) {
        throwOptionError('totalPages', 'must be a number')
    }

    // ── formatCell ────────────────────────────────────────────────────────────
    if (opts.formatCell !== null && !Utils._isFunction(opts.formatCell)) {
        throwOptionError('formatCell', 'must be a function or null')
    }

    // ── formatHeader ──────────────────────────────────────────────────────────
    if (opts.formatHeader !== null && !Utils._isFunction(opts.formatHeader)) {
        throwOptionError('formatHeader', 'must be a function or null')
    }

    // ── onPaginationChange ────────────────────────────────────────────────────
    if (opts.onPaginationChange !== null && !Utils._isFunction(opts.onPaginationChange)) {
        throwOptionError('onPaginationChange', 'must be a function or null')
    }

    // ── responsive ────────────────────────────────────────────────────────────
    if (!Utils._isObject(opts.responsive) || Utils._isArray(opts.responsive)) {
        throwOptionError('responsive', 'must be a plain object')
    }

    // ── sorting ───────────────────────────────────────────────────────────────
    if (
        typeof opts.sorting !== 'boolean' &&
        !Utils._isArray(opts.sorting)
    ) {
        throwOptionError('sorting', 'must be a boolean or an array of column keys')
    }

    // ── columnWidths ──────────────────────────────────────────────────────────
    if (!Utils._isObject(opts.columnWidths) || Utils._isArray(opts.columnWidths)) {
        throwOptionError('columnWidths', 'must be a plain object mapping column keys to CSS width strings')
    }
    // Every value must be a string (CSS width)
    const colWidthKeys = Utils._keys(opts.columnWidths)
    for (let i = 0; i < colWidthKeys.length; i++) {
        const key = colWidthKeys[i]
        if (!Utils._isString(opts.columnWidths[key])) {
            throwOptionError(
                `columnWidths.${key}`,
                'must be a CSS width string (e.g. "100px", "20%")'
            )
        }
    }

    // ── rowClassFn ────────────────────────────────────────────────────────────
    if (opts.rowClassFn !== null && !Utils._isFunction(opts.rowClassFn)) {
        throwOptionError('rowClassFn', 'must be a function or null')
    }

    // ── cellRenderers ─────────────────────────────────────────────────────────
    if (!Utils._isObject(opts.cellRenderers) || Utils._isArray(opts.cellRenderers)) {
        throwOptionError('cellRenderers', 'must be a plain object mapping column keys to renderer functions')
    }
    const cellRendererKeys = Utils._keys(opts.cellRenderers)
    for (let i = 0; i < cellRendererKeys.length; i++) {
        const key = cellRendererKeys[i]
        if (!Utils._isFunction(opts.cellRenderers[key])) {
            throwOptionError(
                `cellRenderers.${key}`,
                'must be a function: (value, rowData) => string|HTMLElement'
            )
        }
    }

    // ── headerRenderers ───────────────────────────────────────────────────────
    if (!Utils._isObject(opts.headerRenderers) || Utils._isArray(opts.headerRenderers)) {
        throwOptionError('headerRenderers', 'must be a plain object mapping column keys to renderer functions')
    }
    const headerRendererKeys = Utils._keys(opts.headerRenderers)
    for (let i = 0; i < headerRendererKeys.length; i++) {
        const key = headerRendererKeys[i]
        if (!Utils._isFunction(opts.headerRenderers[key])) {
            throwOptionError(
                `headerRenderers.${key}`,
                'must be a function: (label) => string|HTMLElement'
            )
        }
    }

    // ── stickyHeader ──────────────────────────────────────────────────────────
    if (typeof opts.stickyHeader !== 'boolean') {
        throwOptionError('stickyHeader', 'must be a boolean')
    }

    // ── noDataTemplate ────────────────────────────────────────────────────────
    if (
        opts.noDataTemplate !== null &&
        !Utils._isString(opts.noDataTemplate) &&
        !Utils._isFunction(opts.noDataTemplate)
    ) {
        throwOptionError('noDataTemplate', 'must be a string, a function returning a string, or null')
    }

    // ── tableClassName ────────────────────────────────────────────────────────
    if (!Utils._isString(opts.tableClassName)) {
        throwOptionError('tableClassName', 'must be a string')
    }

    // ── onRowClick ────────────────────────────────────────────────────────────
    if (opts.onRowClick !== null && !Utils._isFunction(opts.onRowClick)) {
        throwOptionError('onRowClick', 'must be a function or null')
    }

    // ── Incompatibility checks ────────────────────────────────────────────────
    // cellRenderers and formatCell are both present — warn but do not throw;
    // cellRenderers takes priority per-column.
    if (
        opts.formatCell !== null &&
        Utils._keys(opts.cellRenderers).length > 0
    ) {
        // Both set: cellRenderers win per-column, formatCell acts as fallback.
        // This is a valid combination — no error.
    }

    // headerRenderers and formatHeader coexist similarly.
    // headerRenderers win per-column; no error.

    return opts
}
